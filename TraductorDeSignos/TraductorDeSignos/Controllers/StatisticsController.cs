using Microsoft.AspNetCore.Mvc;

namespace TraductorDeSignos.Controllers
{
    public class StatisticsController : Controller
    {
        // Controlador encargado de la sección de estadísticas
        public IActionResult Index()
        {
           return View();
        }
    }
}
