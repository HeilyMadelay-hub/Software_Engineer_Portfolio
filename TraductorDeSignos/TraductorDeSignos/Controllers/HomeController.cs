using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TraductorDeSignos.Models;

namespace TraductorDeSignos.Controllers
{
    public class HomeController : Controller
    {
        // Muestra la página principal

        private readonly ILogger<HomeController> _logger;//Biblioteca de logs

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()//Carga la pagina
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]// Evita que la respuesta de esta acción se guarde en caché.Retorna la vista "Error" y le pasa un modelo ErrorViewModel
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
            // RequestId se usa para identificar la solicitud que causó el error
            // Activity.Current?.Id obtiene el ID de la actividad actual si existe
            // HttpContext.TraceIdentifier se usa como alternativa si Activity es null
        }
    }
}
