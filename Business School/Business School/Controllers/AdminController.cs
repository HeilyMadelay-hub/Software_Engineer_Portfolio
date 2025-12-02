using Business_School.Data;
using Business_School.Helpers;
using Business_School.Models;
using Business_School.ViewModels.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace Business_School.Controllers
{
    [Authorize(Roles = RoleHelper.Admin)]
    public class AdminController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly ApplicationDbContext _context;

        public AdminController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<int>> roleManager,
        ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }


        public async Task<IActionResult> Users()
        {
            var users = await _context.Users.AsNoTracking().ToListAsync();
            var list = new List<UserListVM>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                list.Add(new UserListVM
                {
                    Id = u.Id,
                    Email = u.Email ?? string.Empty,
                    FullName = u.FullName,
                    Roles = roles.ToList()
                });
            }
            return View(list);
        }

        public async Task<IActionResult> AssignRole(string userId)
        {
            if (!int.TryParse(userId, out var id)) return BadRequest();
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();
            var current = await _userManager.GetRolesAsync(user);
            var vm = new AssignRoleVM
            {
                UserId = user.Id,
                Email = user.Email!,
                SelectedRoles = current.ToList()
            };
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AssignRole(string userId, List<string> roles)
        {
            if (!int.TryParse(userId, out var id)) return BadRequest();
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var allRoles = new[] { RoleHelper.Admin, RoleHelper.DepartmentManager, RoleHelper.ClubLeader, RoleHelper.Student };
            // Ensure roles exist
            foreach (var r in allRoles)
                if (!await _roleManager.RoleExistsAsync(r))
                    await _roleManager.CreateAsync(new IdentityRole<int>(r));

            var current = await _userManager.GetRolesAsync(user);
            var toRemove = current.Where(r => !roles.Contains(r));
            var toAdd = roles.Where(r => !current.Contains(r));

            if (toRemove.Any()) await _userManager.RemoveFromRolesAsync(user, toRemove);
            if (toAdd.Any()) await _userManager.AddToRolesAsync(user, toAdd);

            TempData["Success"] = "Roles actualizados";
            return RedirectToAction(nameof(Users));
        }


        public async Task<IActionResult> AssignDepartmentManager()
        {
            var vm = new AssignDepartmentManagerVM
            {
                Departments = await _context.Departments.OrderBy(d => d.Name)
            .Select(d => new SelectListItem { Value = d.Id.ToString(), Text = d.Name }).ToListAsync(),
                Users = await _context.Users.OrderBy(u => u.FullName)
            .Select(u => new SelectListItem { Value = u.Id.ToString(), Text = u.FullName + " (" + u.Email + ")" }).ToListAsync()
            };
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AssignDepartmentManager(string userId, int departmentId)
        {
            if (!int.TryParse(userId, out var id)) return BadRequest();
            var dep = await _context.Departments.FindAsync(departmentId);
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (dep == null || user == null) return NotFound();

            dep.ManagerUserId = user.Id;
            await _context.SaveChangesAsync();

            // Ensure role
            if (!await _userManager.IsInRoleAsync(user, RoleHelper.DepartmentManager))
                await _userManager.AddToRoleAsync(user, RoleHelper.DepartmentManager);

            TempData["Success"] = "Department Manager asignado";
            return RedirectToAction(nameof(Users));
        }

        public async Task<IActionResult> AssignClubLeader()
        {
            var vm = new AssignClubLeaderVM
            {
                Clubs = await _context.Clubs.OrderBy(c => c.Name)
            .Select(c => new SelectListItem { Value = c.Id.ToString(), Text = c.Name }).ToListAsync(),
                Users = await _context.Users.OrderBy(u => u.FullName)
            .Select(u => new SelectListItem { Value = u.Id.ToString(), Text = u.FullName + " (" + u.Email + ")" }).ToListAsync()
            };
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AssignClubLeader(string userId, int clubId)
        {
            if (!int.TryParse(userId, out var id)) return BadRequest();
            var club = await _context.Clubs.FindAsync(clubId);
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (club == null || user == null) return NotFound();

            club.LeaderId = user.Id;
            await _context.SaveChangesAsync();

            if (!await _userManager.IsInRoleAsync(user, RoleHelper.ClubLeader))
                await _userManager.AddToRoleAsync(user, RoleHelper.ClubLeader);

            TempData["Success"] = "Club Leader asignado";
            return RedirectToAction(nameof(Users));
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            if (!int.TryParse(userId, out var id)) return BadRequest();
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                TempData["Error"] = string.Join(", ", result.Errors.Select(e => e.Description));
                return RedirectToAction(nameof(Users));
            }

            TempData["Success"] = "Usuario eliminado";
            return RedirectToAction(nameof(Users));
        }
    }
}
