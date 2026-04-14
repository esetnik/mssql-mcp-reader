# @esetnik/mssql-mcp-reader

Thin launcher for [`@connorbritain/mssql-mcp-reader`](https://www.npmjs.com/package/@connorbritain/mssql-mcp-reader) preloaded with [`@esetnik/mssql-mcp-core`](https://www.npmjs.com/package/@esetnik/mssql-mcp-core) — a fork of the upstream core that adds:

- Direct ODBC connection strings via `SQL_CONNECTION_STRING`
- Windows Integrated Authentication via `msnodesqlv8`
- `REQUEST_TIMEOUT` env var that sets both connection and command timeouts
- Classified query error codes (`QUERY_TIMEOUT`, `INVALID_COLUMN`, `SYNTAX_ERROR`, etc.) with SQL Server's error message passed through for non-connection errors

## Install in Claude Code

```bash
claude mcp add mssql -s user \
  -e "SQL_CONNECTION_STRING=Driver={ODBC Driver 17 for SQL Server};Server=your-host;Database=your-db;Trusted_Connection=Yes;Encrypt=No;TrustServerCertificate=Yes;Connection Timeout=60;" \
  -e SQL_DRIVER=msnodesqlv8 \
  -e REQUEST_TIMEOUT=300 \
  -- npx -y @esetnik/mssql-mcp-reader
```

## How it works

The `mssql` Node driver is a singleton once imported. To swap in `msnodesqlv8` (the Windows-auth-capable driver) you have to patch it *before* the reader imports it. This package's `bin/mssql-mcp-reader.js` spawns a fresh `node` process with `--import <preload-driver.js>` pointing at the core's preloader, then executes the upstream reader's entry point as argv[1]. The preloader runs first, patches `mssql`, and only then does the reader load.

## License

MIT. Depends on upstream MIT-licensed packages by Connor England.
