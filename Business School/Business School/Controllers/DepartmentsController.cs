using Business_School.Data;
using Business_School.Models;
using Business_School.Models.JoinTables;
using Microsoft.AspNetCore.Authorization;
using Business_School.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Build.Framework;
using Microsoft.EntityFrameworkCore;

namespace Business_School.Controllers
{
    [Authorize(Roles= "Admin,DepartmentManager ")]
    public class DepartmentsController : Controller
    {


        private readonly ApplicationDbContext _db;

        public DepartmentsController(ApplicationDbContext db){

            _db = db;

        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // Bring the collection that waits the view(IEnumerable<Department>)
            var departments = await _db.Departments
                .Include(d => d.ManagerUser)
                .Include(d => d.Clubs)
                .Include(d => d.Students)
                .AsNoTracking()
                .ToListAsync();

            return View(departments);


        }


        [HttpGet]
        [Authorize(Roles = "Admin, DepartmentManager")]
        public async Task<IActionResult> Create()
        {

            var users = await GetAssignableManagersAsync();

            var vm = new DepartmentFormViewModel
            {
                Department = new Department(),  // department is empty (new)
                Managers = users                // list is loaded!
            };

            return View(vm);  
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin, DepartmentManager")]
        public async Task<IActionResult> Create(DepartmentFormViewModel vm)
        {
            if (!ModelState.IsValid)
            {
                // recargar lista de managers si falla la validación
                vm.Managers = await GetAssignableManagersAsync();
                return View(vm);
            }

            _db.Departments.Add(vm.Department);
            await _db.SaveChangesAsync();

            TempData["Success"] = "Departamento creado correctamente.";
            return RedirectToAction(nameof(Index));
        }


        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var departamentoToUpdate = await _db.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            //We have to pass the user list for the drop down if we dont do it it will be appear empty
            var users = await GetAssignableManagersAsync();

            // SelectList: value = Id, text = FullName, selected = ManagerUserId
            ViewBag.Managers = new SelectList(users, "Id", "FullName", departamentoToUpdate.ManagerUserId);

            return View(departamentoToUpdate);
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Department d)
        {

            _db.Update(d);
            await _db.SaveChangesAsync();

            if (User.IsInRole("Admin") || User.IsInRole("DepartmentManager"))
            {
                return RedirectToAction("Details", new { id = d.Id });
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        //if you check the data base→ use async/await

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int? id)
        {
            var department = await _db.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            return View(department);
        }



        // DELETE - Solo Admin
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]  
        public async Task<IActionResult> DeleteConfirmed(int? id)
        {
            var department = await _db.Departments
                .Include(d => d.Clubs)
                .Include(d => d.Students)
                .Include(d=>d.ManagerUser)
                .Include(d => d.Events)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
                return NotFound();

            if (department.Clubs.Any() || department.Students.Any() || department.Events.Any())
            {
                TempData["Error"] = "No se puede eliminar un departamento con clubs, estudiantes o eventos asociados.";
                return RedirectToAction("Details", new { id });
            }

            _db.Departments.Remove(department);
            await _db.SaveChangesAsync();

            TempData["Success"] = "Departamento eliminado correctamente.";
            return RedirectToAction("Index");
        }


        [HttpGet]
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
                return NotFound();

            var department = await _db.Departments
                 .Include(d => d.ManagerUser)
                .Include(d => d.Clubs)
                    .ThenInclude(c => c.StudentClubs)
                        .ThenInclude(sc => sc.UserStudent)
                .Include(d => d.Events)
                .AsNoTracking() 
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
                return NotFound();

            // Calculate the number of the students
            var uniqueStudents = (department.Clubs ?? Enumerable.Empty<Club>())
                .SelectMany(c => c.StudentClubs ?? Enumerable.Empty<StudentClub>())
                .Select(sc => sc.UserStudent)
                .Where(u => u != null)
                .DistinctBy(s => s.Id)
                .ToList();

            ViewData["UniqueStudentsCount"] = uniqueStudents.Count;
            ViewData["UniqueStudents"] = uniqueStudents; 

            return View(department);
        }

        private async Task<List<ApplicationUser>> GetAssignableManagersAsync()
        {
            // 1. Find the Admin role
            var adminRole = await _db.Roles
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Name == "Admin");

            var adminUserIds = new List<int>();

            if (adminRole != null)
            {
                // Get the IDs of all users who have the Admin role
                adminUserIds = await _db.UserRoles
                    .AsNoTracking()
                    .Where(ur => ur.RoleId == adminRole.Id)
                    .Select(ur => ur.UserId)
                    .ToListAsync();
            }

            // 2. Emails that must be EXCLUDED from the dropdown (generic test users)
            var excludedEmails = new List<string>
            {
                "user01@businessschool.com",
                "user02@businessschool.com",
                "user03@businessschool.com"
            };

            // 3. Return ONLY valid assignable users
            //    - Exclude Admins
            //    - Exclude generic test users
            var users = await _db.Users
                .AsNoTracking()
                .Where(u =>
                    !adminUserIds.Contains(u.Id) &&   // exclude Admin users
                    !excludedEmails.Contains(u.Email)) // exclude test/demo users
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return users;
        }




    }

}