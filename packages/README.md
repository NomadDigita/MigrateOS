# Packages

This directory is reserved for independently versioned, reusable packages only. MigrateOS does not create a package for a single caller: UI primitives belong in the frontend until a second application needs them, and Python interfaces belong in their owning clean-architecture layer until a genuine cross-process contract emerges.
