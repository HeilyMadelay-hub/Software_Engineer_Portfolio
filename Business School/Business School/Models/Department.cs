using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Business_School.Models
{
    public class Department
    {

      
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string OfficeLocation { get; set; } = string.Empty;



        public int? ManagerUserId { get; set; }
        public ApplicationUser? ManagerUser { get; set; }


        public ICollection<ApplicationUser> Students { get; set; } = new List<ApplicationUser>();
        public ICollection<Club> Clubs { get; set; } = new List<Club>();
        public ICollection<Event> Events { get; set; } = new List<Event>();
  
    }

}