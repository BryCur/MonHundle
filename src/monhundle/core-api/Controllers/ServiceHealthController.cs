using Microsoft.AspNetCore.Mvc;

namespace core_api.Controllers;

[ApiController]
[Route("service")]
public class ServiceHealthController
{
    [HttpGet("Status")]
    public IActionResult GetServiceStatus()
    {
        return new OkObjectResult("Service is alive");
    }
}