using Microsoft.AspNetCore.Mvc;
using ReviewService;

namespace Gateway.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;
    private readonly HttpClient _client;


    public WeatherForecastController(ILogger<WeatherForecastController> logger, IHttpClientFactory clientFactory)
    {
        _logger = logger;
        _client = clientFactory.CreateClient("gateway");
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public async Task<IActionResult> Get()
    {
        var commandeTask = _client.GetAsync("api/service/WeatherForecast");
        var reviewTask = _client.GetAsync("api/review/WeatherForecast");

        // Attend que les deux r�ponses soient termin�es
        await Task.WhenAll(commandeTask, reviewTask);

        // R�cup�re les r�sultats
        var commandeResponse = await commandeTask;
        var reviewResponse = await reviewTask;

        // Lecture des donn�es JSON en parall�le �galement (optionnel mais coh�rent)
        var commandeReadTask = commandeResponse.Content.ReadFromJsonAsync<WeatherForecast[]>();
        var reviewReadTask = reviewResponse.Content.ReadFromJsonAsync<WeatherForecast[]>();

        await Task.WhenAll(commandeReadTask, reviewReadTask);

        var commandeData = await commandeReadTask;
        var reviewData = await reviewReadTask;

        return Ok(new
        {
            Commande = commandeData,
            Review = reviewData
        });
    }

}
