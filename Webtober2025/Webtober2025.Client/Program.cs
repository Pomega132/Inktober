using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MudBlazor.Services;

namespace Webtober2025.Client
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);
            builder.Services.AddMudServices(option =>
            {
                option.SnackbarConfiguration.PositionClass = MudBlazor.Defaults.Classes.Position.TopRight;
            });

            await builder.Build().RunAsync();
        }
    }
}
