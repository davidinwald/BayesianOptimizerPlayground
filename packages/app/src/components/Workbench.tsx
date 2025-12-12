import { useState, useEffect, useCallback, useRef } from 'react';

interface Point {
  x: number[];
  y: number;
  step: number;
  isNewBest?: boolean;
  isLatest?: boolean;
}

export default function Workbench() {
  const [points, setPoints] = useState<Point[]>([]);
  const [bestSoFar, setBestSoFar] = useState<number>(Infinity);
  const [bestX, setBestX] = useState<number[] | null>(null);
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string>('Ready');
  const [statusDetail, setStatusDetail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showMath, setShowMath] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  const runOptimization = useCallback(async () => {
    try {
      setError(null);
      setStatus('Loading modules...');
      setStatusDetail('Loading Bayesian Optimization engine and plugins...');

      // Dynamic imports
      const engineModule = await import('@bo/engine');
      setStatusDetail('Loaded engine, loading RBF kernel...');
      const rbfModule = await import('@bo/plugin-kernel-rbf');
      setStatusDetail('Loaded kernel, loading acquisition function...');
      const eiModule = await import('@bo/plugin-acquisition-ei');
      setStatusDetail('Loaded acquisition, loading test function...');
      const braninModule = await import('@bo/plugin-oracle-branin');
      setStatusDetail('Loaded test function, loading optimizer...');
      const optimizerModule = await import('@bo/plugin-optimizer-multi-start');

      setStatus('Initializing...');
      setStatusDetail('Setting up optimization problem (Branin function, 2D continuous domain)...');

      // Set up domain
      const domain = braninModule.getDomain();
      const rng = new engineModule.SeededRNG(42);

      // Create kernel function
      const kernelFn = {
        cov: (X: number[][], Xprime: number[][], params: Record<string, unknown>) => {
          return rbfModule.cov(X, Xprime, params as any, { jitter: 1e-6, tolerance: 1e-6, maxCondition: 1e12 });
        },
        diag: (X: number[][], params: Record<string, unknown>) => {
          return rbfModule.diag(X, params as any);
        },
      };

      // Create acquisition function
      const acquisitionFn = {
        score: (Xstar: number[][], posterior: any, context: any, params: Record<string, unknown>) => {
          return eiModule.score(Xstar, posterior, context, params as any);
        },
      };

      // Create optimizer
      const optimizerFn = {
        ask: (k: number, acqFn: any, dom: any, ctx: any, params: Record<string, unknown>, state: any) => {
          return optimizerModule.ask(k, acqFn, dom, ctx, params as any, state);
        },
        initialize: (dataset: any, dom: any, ctx: any, params: Record<string, unknown>) => {
          return optimizerModule.initialize(dataset, dom, ctx, params as any);
        },
        tell: (obs: any, state: any) => {
          return optimizerModule.tell(obs, state);
        },
      };

      // Create oracle
      const oracleFn = {
        evaluate: (x: number[][]) => {
          const results = braninModule.evaluate(x, {}, domain, rng);
          const arr = Array.isArray(results) ? results : [results];
          return arr.map((r) => ({ y: r.y, noiseStd: r.noiseStd }));
        },
        getDomain: () => domain,
      };

      // Create runner
      const runner = new engineModule.BORunner({
        domain,
        kernel: kernelFn,
        kernelParams: { lengthscale: 1.0, variance: 1.0 },
        acquisition: acquisitionFn,
        acquisitionParams: { xi: 0.01 },
        optimizer: optimizerFn,
        optimizerParams: { restarts: 10, maxIterations: 50 },
        oracle: oracleFn,
        initialDesign: { method: 'lhs', n: 5 },
        budget: 30,
        noise: 0.1,
        jitter: 1e-6,
        seed: 42,
      });

      // Run steps
      setStatus('Running optimization...');
      setStatusDetail('Using Expected Improvement to select next evaluation point...');
      
      for (let i = 0; i < 30; i++) {
        if (!isRunning) break;
        
        setStatusDetail(`Step ${i + 1}/30: Building Gaussian Process model from ${i + 5} observations...`);
        await new Promise((resolve) => setTimeout(resolve, 50));
        
        setStatusDetail(`Step ${i + 1}/30: Optimizing acquisition function to find next point...`);
        await new Promise((resolve) => setTimeout(resolve, 50));
        
        const hasMore = await runner.step();
        const state = runner.getState();

        // Update UI with batched updates to reduce flicker
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          const newPoints: Point[] = state.dataset.X.map((x: number[], idx: number) => {
            const y = state.dataset.y[idx];
            const isNewBest = y === state.bestSoFar;
            const isLatest = idx === state.dataset.X.length - 1;
            return {
              x,
              y,
              step: idx,
              isNewBest,
              isLatest,
            };
          });

          setPoints(newPoints);
          const previousBest = bestSoFar;
          setBestSoFar(state.bestSoFar);
          setBestX(state.bestX || null);
          setStep(state.step);
          const latestPoint = newPoints[newPoints.length - 1];
          const isNewBest = latestPoint.isNewBest;
          const improvement = isNewBest ? `🎯 NEW BEST! (improved by ${(previousBest - state.bestSoFar).toFixed(4)})` : '';
          const stagnation = !isNewBest && state.step > 5 ? `⚠️ No improvement for ${state.step - newPoints.findIndex(p => p.y === state.bestSoFar) - 1} steps` : '';
          setStatus(`Step ${state.step} / 30`);
          setStatusDetail(`Evaluated point [${latestPoint.x.map(x => x.toFixed(2)).join(', ')}] → Value: ${latestPoint.y.toFixed(4)} ${improvement} ${stagnation}`);
        });

        if (!hasMore) {
          setStatus('Complete');
          setStatusDetail(`Optimization finished! Found best value: ${state.bestSoFar.toFixed(4)}`);
          setIsRunning(false);
          break;
        }

        // Delay for UI updates - longer delay to reduce flicker
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (step >= 30) {
        setStatus('Complete');
        setStatusDetail('Optimization finished! All 30 steps completed.');
        setIsRunning(false);
      }
    } catch (err) {
      console.error('Error running optimization:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Error');
      setIsRunning(false);
    }
  }, [isRunning, step]);

  useEffect(() => {
    if (isRunning && step < 30) {
      runOptimization();
    }
    // Cleanup animation frame on unmount or stop
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, step, runOptimization]);

  const handleStart = () => {
    setIsRunning(true);
    setStep(0);
    setPoints([]);
    setBestSoFar(Infinity);
    setBestX(null);
    setError(null);
    setStatus('Starting...');
    setStatusDetail('Click Start Optimization to begin');
  };

  const handleStop = () => {
    setIsRunning(false);
    setStatus('Stopped');
    setStatusDetail('Optimization was stopped by user');
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Info Section */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
        <h3 style={{ marginTop: 0, color: '#1565c0' }}>What's happening?</h3>
        <p style={{ margin: '8px 0', color: '#424242', lineHeight: '1.6' }}>
          This is a <strong>Bayesian Optimization</strong> demo optimizing the <strong>Branin function</strong> (a 2D test function with 3 global minima).
          The algorithm uses a <strong>Gaussian Process</strong> to model the function, <strong>Expected Improvement</strong> to select promising points,
          and <strong>multi-start optimization</strong> to find the best next evaluation.
        </p>
        <div style={{ fontSize: '12px', color: '#616161', marginTop: '8px' }}>
          <strong>Components:</strong> RBF Kernel • Expected Improvement Acquisition • Multi-start Optimizer • Branin Test Function
        </div>
        <button
          onClick={() => setShowMath(!showMath)}
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            background: showMath ? '#1565c0' : 'transparent',
            color: showMath ? 'white' : '#1565c0',
            border: '1px solid #1565c0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {showMath ? '▼ Hide' : '▶ Show'} Mathematical Formulas
        </button>
      </div>

      {/* Math Formulas Section */}
      {showMath && (
        <div style={{ marginBottom: '20px', padding: '20px', background: '#fff9e6', borderRadius: '8px', border: '1px solid #ffd54f' }}>
          <h3 style={{ marginTop: 0, color: '#e65100' }}>Mathematical Foundations</h3>
          
          {/* Branin Function */}
          <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0, color: '#d84315' }}>1. Branin Test Function</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8', color: '#333', marginTop: '10px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>f(x1, x2) = a(x2 - b*x1^2 + c*x1 - r)^2 + s*(1-t)*cos(x1) + s</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                where: a = 1, b = 5.1/(4*pi^2), c = 5/pi, r = 6, s = 10, t = 1/(8*pi)
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Domain: x1 in {'['}-5, 10{']'}, x2 in {'['}0, 15{']'}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Global minima: f ~= 0.397887 at three points
              </div>
            </div>
          </div>

          {/* RBF Kernel */}
          <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0, color: '#d84315' }}>2. RBF (Radial Basis Function) Kernel</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8', color: '#333', marginTop: '10px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>k(x, x') = sigma^2 * exp(-0.5 * ||x - x'||^2 / l^2)</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                where:
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • sigma^2 = variance (signal variance)
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • l = lengthscale (controls smoothness)
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • ||x - x'|| = Euclidean distance
              </div>
            </div>
          </div>

          {/* Gaussian Process */}
          <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0, color: '#d84315' }}>3. Gaussian Process Posterior</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8', color: '#333', marginTop: '10px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>mu(x*) = k*^T * (K + sigma_n^2 * I)^(-1) * y</strong>
              </div>
              <div style={{ marginBottom: '8px', marginTop: '12px' }}>
                <strong>sigma^2(x*) = k(x*, x*) - k*^T * (K + sigma_n^2 * I)^(-1) * k*</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                where:
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • K = covariance matrix of observed points
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • k* = covariance vector between x* and observed points
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • sigma_n^2 = noise variance
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • y = observed function values
              </div>
            </div>
          </div>

          {/* Expected Improvement */}
          <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0, color: '#d84315' }}>4. Expected Improvement (EI) Acquisition Function</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8', color: '#333', marginTop: '10px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>EI(x) = sigma(x) * [z * Phi(z) + phi(z)]</strong>
              </div>
              <div style={{ marginBottom: '8px', marginTop: '12px' }}>
                <strong>where: z = (mu(x) - f* - xi) / sigma(x)</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                where:
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • mu(x), sigma(x) = GP mean and std at x
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • f* = best observed value so far
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • xi = exploration-exploitation trade-off parameter
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                • Phi(z) = standard normal CDF, phi(z) = standard normal PDF
              </div>
            </div>
          </div>

          {/* Optimization Loop */}
          <div style={{ padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0, color: '#d84315' }}>5. Optimization Loop</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.8', color: '#333', marginTop: '10px' }}>
              <div style={{ marginBottom: '6px' }}>1. Initialize: Sample 5 points using Latin Hypercube Sampling</div>
              <div style={{ marginBottom: '6px' }}>2. For each iteration:</div>
              <div style={{ marginLeft: '20px', marginBottom: '4px' }}>a) Fit GP: mu(x), sigma(x) from observed data</div>
              <div style={{ marginLeft: '20px', marginBottom: '4px' }}>b) Compute EI(x) across domain</div>
              <div style={{ marginLeft: '20px', marginBottom: '4px' }}>c) Optimize: x* = argmax EI(x)</div>
              <div style={{ marginLeft: '20px', marginBottom: '4px' }}>d) Evaluate: y* = f(x*) + epsilon (with noise)</div>
              <div style={{ marginLeft: '20px', marginBottom: '6px' }}>e) Update dataset: D = D U {'{'}(x*, y*){'}'}</div>
              <div style={{ marginBottom: '6px' }}>3. Return best point: x* = argmin y_i</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Controls</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={isRunning ? handleStop : handleStart}
            disabled={step >= 30}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              background: isRunning ? '#ff4444' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: step >= 30 ? 'not-allowed' : 'pointer',
              opacity: step >= 30 ? 0.6 : 1,
              fontWeight: 'bold',
            }}
          >
            {isRunning ? '⏸ Stop' : step >= 30 ? '✓ Complete' : '▶ Start Optimization'}
          </button>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {status}
            </div>
            {statusDetail && (
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                {statusDetail}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginTop: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div><strong>Progress:</strong> {step} / 30 steps</div>
          <div><strong>Best value:</strong> {bestSoFar !== Infinity ? bestSoFar.toFixed(4) : 'N/A'}</div>
          {bestX && <div><strong>Best point:</strong> [{bestX.map((x) => x.toFixed(2)).join(', ')}]</div>}
          <div><strong>Observations:</strong> {points.length} points</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Evaluated Points ({points.length})</span>
          {points.length > 0 && (
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
              Best: {bestSoFar !== Infinity ? bestSoFar.toFixed(4) : 'N/A'}
            </span>
          )}
        </h2>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', background: 'white' }}>
          {points.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              No points evaluated yet. Click "Start Optimization" to begin.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>#</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Point (x1, x2)</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Value</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, i) => {
                  const isBest = p.isNewBest;
                  const isLatest = p.isLatest;
                  const prevBest = i > 0 ? Math.min(...points.slice(0, i).map(pt => pt.y)) : Infinity;
                  const improvement = isBest && prevBest !== Infinity ? (prevBest - p.y).toFixed(4) : null;
                  
                  return (
                    <tr
                      key={i}
                      style={{
                        borderTop: '1px solid #eee',
                        background: isLatest ? '#fff3e0' : isBest ? '#e8f5e9' : 'white',
                        animation: isLatest ? 'pulse 1s ease-in-out' : 'none',
                        transition: 'background 0.3s',
                      }}
                    >
                      <td style={{ padding: '10px', fontWeight: isLatest ? 'bold' : 'normal' }}>
                        {p.step + 1}
                        {isLatest && <span style={{ marginLeft: '4px', color: '#ff9800' }}>●</span>}
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '13px' }}>
                        ({p.x[0].toFixed(3)}, {p.x[1].toFixed(3)})
                      </td>
                      <td style={{ padding: '10px', fontWeight: isBest ? 'bold' : 'normal', color: isBest ? '#2e7d32' : '#333' }}>
                        {p.y.toFixed(4)}
                      </td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>
                        {isBest && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>🏆 Best</span>}
                        {isLatest && !isBest && <span style={{ color: '#ff9800' }}>⏳ Just evaluated</span>}
                        {improvement && <span style={{ color: '#4caf50', marginLeft: '8px' }}>(+{improvement})</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Branin Function Visualization */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Branin Function (What We're Optimizing)</h2>
        <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            <strong>Expected behavior:</strong> The Branin function has 3 global minima near f ≈ 0.398. 
            You should see the algorithm explore the space and gradually find better values. 
            The best value should improve from the initial random samples (typically 10-50) down toward ~0.4.
          </div>
          <div style={{ position: 'relative', height: '300px', background: 'white', borderRadius: '4px', border: '1px solid #ccc' }}>
            {(() => {
              // Generate Branin function values for contour
              const gridSize = 50;
              const x1Min = -5, x1Max = 10;
              const x2Min = 0, x2Max = 15;
              const values: number[][] = [];
              
              for (let i = 0; i < gridSize; i++) {
                values[i] = [];
                for (let j = 0; j < gridSize; j++) {
                  const x1 = x1Min + (i / (gridSize - 1)) * (x1Max - x1Min);
                  const x2 = x2Min + (j / (gridSize - 1)) * (x2Max - x2Min);
                  
                  // Branin function
                  const a = 1;
                  const b = 5.1 / (4 * Math.PI * Math.PI);
                  const c = 5 / Math.PI;
                  const r = 6;
                  const s = 10;
                  const t = 1 / (8 * Math.PI);
                  const term1 = a * Math.pow(x2 - b * x1 * x1 + c * x1 - r, 2);
                  const term2 = s * (1 - t) * Math.cos(x1);
                  const value = term1 + term2 + s;
                  
                  values[i][j] = value;
                }
              }
              
              const minVal = Math.min(...values.flat());
              const maxVal = Math.max(...values.flat());
              const range = maxVal - minVal;
              
              // Generate contour levels
              const levels = 10;
              const contourValues = [];
              for (let i = 0; i <= levels; i++) {
                contourValues.push(minVal + (range * i / levels));
              }
              
              return (
                <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                  {/* Contour plot */}
                  {values.map((row, i) => 
                    row.map((val, j) => {
                      const x = (i / (gridSize - 1)) * 400;
                      const y = (j / (gridSize - 1)) * 300;
                      const normalized = (val - minVal) / range;
                      const hue = 240 - (normalized * 120); // Blue to red
                      const opacity = 0.3 + normalized * 0.4;
                      return (
                        <rect
                          key={`${i}-${j}`}
                          x={x}
                          y={y}
                          width={400 / gridSize}
                          height={300 / gridSize}
                          fill={`hsl(${hue}, 70%, ${50 + normalized * 30}%)`}
                          opacity={opacity}
                        />
                      );
                    })
                  )}
                  
                  {/* Global minima markers */}
                  {[
                    [-Math.PI, 12.275],
                    [Math.PI, 2.275],
                    [9.42478, 2.475]
                  ].map(([x1, x2], idx) => {
                    const x = ((x1 - x1Min) / (x1Max - x1Min)) * 400;
                    const y = ((x2 - x2Min) / (x2Max - x2Min)) * 300;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="4" fill="#2e7d32" stroke="white" strokeWidth="1" />
                        <text x={x + 6} y={y} fill="#2e7d32" fontSize="10" fontWeight="bold">Min {idx + 1}</text>
                      </g>
                    );
                  })}
                  
                  {/* Evaluated points */}
                  {points.map((p, idx) => {
                    const x = ((p.x[0] - x1Min) / (x1Max - x1Min)) * 400;
                    const y = ((p.x[1] - x2Min) / (x2Max - x2Min)) * 300;
                    const isBest = p.isNewBest;
                    const isLatest = p.isLatest;
                    return (
                      <g key={idx}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isBest ? 6 : isLatest ? 5 : 3}
                          fill={isBest ? '#2e7d32' : isLatest ? '#ff9800' : 'white'}
                          stroke={isBest ? 'white' : isLatest ? '#ff9800' : '#666'}
                          strokeWidth={isBest || isLatest ? 2 : 1}
                          opacity={isLatest ? 1 : 0.7}
                        />
                        {isLatest && (
                          <circle
                            cx={x}
                            cy={y}
                            r="10"
                            fill="none"
                            stroke="#ff9800"
                            strokeWidth="2"
                            opacity="0.5"
                            style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
                          />
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Axes labels */}
                  <text x="200" y="295" fill="#666" fontSize="11" textAnchor="middle">x1</text>
                  <text x="10" y="150" fill="#666" fontSize="11" textAnchor="middle" transform="rotate(-90, 10, 150)">x2</text>
                </svg>
              );
            })()}
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔵 High values (worse)</span>
            <span>🟢 Low values (better)</span>
            <span>🟢 Green dots = Best points</span>
            <span>🟠 Orange = Latest evaluation</span>
          </div>
        </div>
      </div>

      {points.length > 0 && (
        <div>
          <h2>Optimization Progress</h2>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>Best Value Over Time</strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Lower is better • The green line shows the best value found so far (should decrease over time)
                </div>
                {points.length > 0 && (() => {
                  const firstBest = Math.min(...points.slice(0, 5).map(p => p.y));
                  const improvement = firstBest - bestSoFar;
                  const improvementPct = ((improvement / firstBest) * 100).toFixed(1);
                  const bestFoundAt = points.findIndex(p => p.y === bestSoFar) + 1;
                  return (
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      <span>Initial best: {firstBest.toFixed(2)}</span>
                      <span>Improvement: {improvement > 0 ? `-${improvement.toFixed(2)} (${improvementPct}%)` : 'None yet'}</span>
                      <span>Best found at step: {bestFoundAt}</span>
                      <span style={{ color: step - bestFoundAt > 10 ? '#ff9800' : '#666' }}>
                        Steps since best: {step - bestFoundAt + 1}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                  {bestSoFar !== Infinity ? bestSoFar.toFixed(4) : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Current Best</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                  Target: ~0.398
                </div>
                {bestSoFar !== Infinity && bestSoFar > 1 && (
                  <div style={{ fontSize: '11px', color: '#ff9800', marginTop: '4px', fontWeight: 'bold' }}>
                    Still {((bestSoFar - 0.398) / 0.398 * 100).toFixed(0)}% above target
                  </div>
                )}
              </div>
            </div>
            
            {/* Line chart showing best value over time */}
            <div style={{ position: 'relative', height: '250px', marginBottom: '20px', paddingLeft: '50px', paddingRight: '20px' }}>
              {(() => {
                const maxY = Math.max(...points.map(p => p.y));
                const minY = Math.min(...points.map(p => p.y));
                const range = maxY - minY || 1;
                const padding = 20;
                const chartWidth = 800 - padding * 2;
                const chartHeight = 200 - padding * 2;
                const steps = 5;
                
                // Generate grid lines
                const gridLines = [];
                for (let i = 0; i <= steps; i++) {
                  const value = maxY - (range * i / steps);
                  const y = padding + (i / steps) * chartHeight;
                  gridLines.push({ value, y });
                }
                
                // Generate line points for best value progression
                const linePoints = points.length > 1 ? points.map((p, i) => {
                  const bestUpToNow = Math.min(...points.slice(0, i + 1).map(pt => pt.y));
                  const x = padding + (i / Math.max(points.length - 1, 1)) * chartWidth;
                  const y = padding + ((maxY - bestUpToNow) / range) * chartHeight;
                  return { x, y, bestUpToNow, actualY: p.y };
                }) : [];
                
                // Also show all evaluated values as light dots
                const allPoints = points.map((p, i) => {
                  const x = padding + (i / Math.max(points.length - 1, 1)) * chartWidth;
                  const y = padding + ((maxY - p.y) / range) * chartHeight;
                  return { x, y, value: p.y };
                });
                
                return (
                  <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    {/* Y-axis grid lines and labels */}
                    {gridLines.map(({ value, y }, i) => (
                      <g key={i}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={800 - padding}
                          y2={y}
                          stroke="#e0e0e0"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                        <text
                          x={padding - 10}
                          y={y}
                          fill="#666"
                          fontSize="11"
                          textAnchor="end"
                          dominantBaseline="middle"
                        >
                          {value.toFixed(2)}
                        </text>
                      </g>
                    ))}
                    
                    {/* All evaluated values (light gray dots) */}
                    {allPoints.map((pointData, i) => {
                      const p = points[i];
                      const isBest = p.isNewBest;
                      const isLatest = p.isLatest;
                      if (isBest || isLatest) return null; // Skip best/latest here, show them separately
                      return (
                        <circle
                          key={`all-${i}`}
                          cx={pointData.x}
                          cy={pointData.y}
                          r="2"
                          fill="#ccc"
                          opacity="0.5"
                        />
                      );
                    })}
                    
                    {/* Best value line (should be monotonically decreasing) */}
                    {linePoints.length > 1 && (
                      <>
                        <polyline
                          points={linePoints.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke="#2e7d32"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Highlight segments where best improved */}
                        {linePoints.map((pointData, i) => {
                          if (i === 0) return null;
                          const prevBest = linePoints[i - 1].bestUpToNow;
                          const currBest = pointData.bestUpToNow;
                          const improved = currBest < prevBest;
                          if (!improved) return null;
                          return (
                            <line
                              key={`improve-${i}`}
                              x1={linePoints[i - 1].x}
                              y1={linePoints[i - 1].y}
                              x2={pointData.x}
                              y2={pointData.y}
                              stroke="#4caf50"
                              strokeWidth="4"
                              strokeLinecap="round"
                              opacity="0.6"
                            />
                          );
                        })}
                      </>
                    )}
                    
                    {/* Best value points (on the line) */}
                    {linePoints.map((pointData, i) => {
                      const p = points[i];
                      const isNewBest = p.isNewBest;
                      const isLatest = p.isLatest;
                      
                      return (
                        <g key={`best-${i}`}>
                          {isLatest && (
                            <circle
                              cx={pointData.x}
                              cy={pointData.y}
                              r="12"
                              fill="none"
                              stroke="#ff9800"
                              strokeWidth="2"
                              opacity="0.3"
                              style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
                            />
                          )}
                          <circle
                            cx={pointData.x}
                            cy={pointData.y}
                            r={isNewBest ? 6 : isLatest ? 5 : 4}
                            fill={isNewBest ? '#2e7d32' : isLatest ? '#ff9800' : '#4caf50'}
                            stroke="white"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
              
              {/* X-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#666' }}>
                <span>Step 1</span>
                <span>Step {Math.ceil(points.length / 2)}</span>
                <span>Step {points.length}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                <span>Progress: {step} / 30 evaluations</span>
                <span>{Math.round((step / 30) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(step / 30) * 100}%`,
                    height: '100%',
                    background: isRunning ? 'linear-gradient(90deg, #4caf50, #81c784)' : '#4caf50',
                    transition: 'width 0.3s ease',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
