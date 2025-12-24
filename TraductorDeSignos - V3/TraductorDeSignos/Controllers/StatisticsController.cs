using Microsoft.AspNetCore.Mvc;

namespace TraductorDeSignos.Controllers
{
    public class StatisticsController : Controller
    {
        public IActionResult Index()
    {
        return View();
        }
    }
}
