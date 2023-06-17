rm /mnt/f/HL/HogWarpServer/plugins/FlooLink/*
dotnet publish -c Release FlooLinkServer/FlooLinkServer.csproj 
cp ./bin/Release/net7.0/publish/* /mnt/f/HL/HogWarpServer/plugins/FlooLink/