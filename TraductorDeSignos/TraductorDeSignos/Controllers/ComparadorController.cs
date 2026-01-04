using Microsoft.AspNetCore.Mvc;

namespace TraductorDeSignos.Controllers
{
    public class ComparadorController : Controller
    {
        // Muestra la página principal de comparacion de signos.
        public IActionResult Index()
        {
            return View();
        }
    }
}
