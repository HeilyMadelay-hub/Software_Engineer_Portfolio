using Microsoft.AspNetCore.Mvc;

namespace TraductorDeSignos.Controllers
{
    public class AboutController : Controller
    {
        // Muestra la página principal de información del proyecto.
        public IActionResult Index()
        {
            return View();
        }
    }
}
