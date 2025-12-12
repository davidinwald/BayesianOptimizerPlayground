# Serialization

All plugin inputs/outputs must be JSON-serializable.

## Run Export

```json
{
  "engine_version": "0.1.0",
  "plugin_versions": {
    "kernel:rbf": "1.0.0",
    "acquisition:ei": "1.0.0"
  },
  "seed": 42,
  "domain": { ... },
  "parameters": { ... },
  "events": [ ... ]
}
```

## Share Links

Compress scenario + seed into URL using deflate + base64url encoding.

## Migration

Event logs include versions to enable migration or "best-effort" replays.

