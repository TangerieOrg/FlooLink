rm /mnt/f/HL/HogWarpServer/plugins/FlooLink/*
dotnet publish -c Debug FlooLinkServer/FlooLinkServer.csproj 
cp ./bin/Debug/net7.0/publish/* /mnt/f/HL/HogWarpServer/plugins/FlooLink/