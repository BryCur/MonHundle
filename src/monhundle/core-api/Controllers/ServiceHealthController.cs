using Microsoft.AspNetCore.Mvc;

namespace core_api.Controllers;

[ApiController]
[Route("service")]
public class ServiceHealthController
{
    [HttpGet("Status")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public ActionResult<string> GetServiceStatus()
    {
        return new OkObjectResult("Service is alive");
    }

    [HttpHead("Status")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public ActionResult<string> GetServiceStatusHead()
    {
        return new OkObjectResult("Service is alive");
    }
}