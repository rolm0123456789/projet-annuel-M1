using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

namespace GateWay.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GateWayController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        public GateWayController(IHttpClientFactory factory)
        {
            _httpClient = factory.CreateClient();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var cuisinePort = Environment.GetEnvironmentVariable("CUISINE_PORT");
            var livraisonPort = Environment.GetEnvironmentVariable("LIVRAISON_PORT");

            var authUrl = $"http://localhost:{cuisinePort}/api/kitchen/orders";
            var livraisonUrl = $"http://localhost:{livraisonPort}/livreurs/{userId}";

            try
            {
                var userTask = _httpClient.GetFromJsonAsync<object>(authUrl);
                var deliveriesTask = _httpClient.GetFromJsonAsync<object>(livraisonUrl);

                await Task.WhenAll(userTask, deliveriesTask);

                var result = new
                {
                    User = userTask.Result,
                    Deliveries = deliveriesTask.Result
                };

                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, $"Erreur d’appel à un service : {ex.Message}");
            }
        }
    }
}
