using Business_School.Models;

namespace Business_School.ViewModels

{
    public class DepartmentFormViewModel
    {
        public Department Department { get; set; }
        public List<ApplicationUser> Managers { get; set; } = new();
    }

}
