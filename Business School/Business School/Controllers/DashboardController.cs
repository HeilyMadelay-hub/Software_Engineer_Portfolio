using Business_School.Data;
using Business_School.Helpers;
using Business_School.Models;
using Business_School.Services;
using Business_School.Services.Recommendation;
using Business_School.ViewModels.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Business_School.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _db;
        private readonly IGamificationService _gamificationService;
        private readonly IRecommendationService _recommendationService;

        public DashboardController(ApplicationDbContext db, IGamificationService gamificationService, IRecommendationService recommendationService)
        {
            _db = db;
            _gamificationService = gamificationService;
            _recommendationService = recommendationService;
        }

        public async Task<IActionResult> Index()
        {
            if (User.IsInRole(RoleHelper.Admin)) return RedirectToAction(nameof(Admin));
            if (User.IsInRole(RoleHelper.DepartmentManager)) return RedirectToAction(nameof(DepartmentManager));
            if (User.IsInRole(RoleHelper.ClubLeader)) return RedirectToAction(nameof(ClubLeader));
            if (User.IsInRole(RoleHelper.Student)) return RedirectToAction(nameof(Student));
            return View();
        }

        [Authorize(Roles = RoleHelper.Admin)]
        public async Task<IActionResult> Admin()
        {
            var vm = new DashboardAdminVM
            {
                TotalStudents = await _db.Users.CountAsync(),
                TotalClubs = await _db.Clubs.CountAsync(),
                TotalDepartments = await _db.Departments.CountAsync(),
                NextEvents = await _db.Events.Where(e => e.StartDate >= DateTime.UtcNow).OrderBy(e => e.StartDate).Take(5).ToListAsync()
            };
            vm.StudentsByDepartment = await _db.Departments
                .Select(d => new { d.Name, Count = d.Students.Count })
                .ToDictionaryAsync(x => x.Name, x => x.Count);

            // Populate recent students based on creation order (approx. by Id)
            vm.RecentStudents = await _db.Users
                .Include(u => u.Department)
                .OrderByDescending(u => u.Id)
                .Take(5)
                .ToListAsync();

            return View(vm);
        }

        [Authorize(Roles = RoleHelper.DepartmentManager)]
        public async Task<IActionResult> DepartmentManager()
        {
            // Manager’s department inferred from Departments.ManagerUserId
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var department = await _db.Departments
                .Include(d => d.Clubs)
                .Include(d => d.Students)
                .Include(d => d.Events)
                .FirstOrDefaultAsync(d => d.ManagerUserId == userId);
            return View(department);
        }

        [Authorize(Roles = RoleHelper.ClubLeader)]
        public async Task<IActionResult> ClubLeader()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var club = await _db.Clubs
                .Include(c => c.StudentClubs).ThenInclude(sc => sc.UserStudent)
                .Include(c => c.EventClubs).ThenInclude(ec => ec.Event)
                .FirstOrDefaultAsync(c => c.LeaderId == userId);
            return View(club);
        }

        [Authorize(Roles = RoleHelper.Student)]
        public async Task<IActionResult> Student()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var user = await _db.Users
                .Include(u => u.ClubMemberships).ThenInclude(sc => sc.Club).ThenInclude(c => c.Department)
                .Include(u => u.EventAttendances).ThenInclude(ea => ea.Event).ThenInclude(e => e.Department)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            var recommended = await _recommendationService.RecommendClubsAsync(user);
            var progress = await _gamificationService.GetProgressAsync(user, User.IsInRole(RoleHelper.ClubLeader));
            // Fallback para puntos si el servicio no suma correctamente
            if (progress != null)
            {
                progress.Points = user.Points;
            }

            ViewData["Clubs"] = user.ClubMemberships.Select(sc => sc.Club).Where(c => c != null).ToList();
            ViewData["Recommended"] = recommended ?? new List<Club>();
            // Próximos eventos: mostrar TODOS los próximos eventos, no solo los registrados
            ViewData["Upcoming"] = await _db.Events
                .Include(e => e.Department)
                .Where(e => e.StartDate >= DateTime.UtcNow)
                .OrderBy(e => e.StartDate)
                .Take(10)
                .ToListAsync();
            ViewData["Progress"] = progress;

            return View();
        }

        public async Task<IActionResult> RecommendedClubs()
        {
            return View();
        }

    }
}
