Copy the required DLLS from HogWarpLib into `./dlls`

Here are the ones I copied

```
HogWarp.Lib.dll
HogWarp.Loader.dll
Newtonsoft.Json.dll
Serilog.Sinks.Console.dll
Serilog.Sinks.File.dll
Serilog.dll
```

`dotnet build -c Release FlooLinkServer/FlooLinkServer.csproj`