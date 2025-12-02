namespace Business_School.ViewModels.Admin
{
 public class UserListVM
 {
 public int Id { get; set; }
 public string Email { get; set; }
 public string FullName { get; set; }
 public List<string> Roles { get; set; } = new();
 }
}
