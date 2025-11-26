using Business_School.Data;
using Business_School.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.SignIn.RequireConfirmedAccount = true;
})
 .AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();


// We now create the initial roles because we have used .AddRoles<IdentityRole>().
// This method adds role support to the Identity system by registering the role services
// and allowing the app to create, manage, and assign roles to users.

//A scope is a controlled lifetime for services, ensuring they live as long as needed and are disposed properly.-Container

using (var scope = app.Services.CreateScope()) {

    // EN: 1- Creates a temporary scope outside an HTTP request and gets the services available in that scope with ServiceProvider
    // ES: 1- Crea un scope temporal fuera de una solicitud HTTP y obtiene los servicios disponibles en ese scope with ServiceProvider

    var services = scope.ServiceProvider;

    // 2. We create the roles
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();

    /*
    In OnModelCreating, we only seed tables that do **NOT** depend on Identity  
    (Departments, Clubs, Events, Achievements, and the intermediate table EventClub).  

    This is done this way because Identity **does not allow seeding** any entity that has  
    foreign keys pointing to AspNetUsers. Therefore, it is impossible to seed the following  
    from OnModelCreating:  
    - StudentClub  
    - StudentAchievement  
    - EventAttendance  
    - nor assign values to ManagerUserId, LeaderId, or OrganizerId.

    That’s why we use an **external DataSeeder** to which we pass  
    UserManager, RoleManager, and the ApplicationDbContext.

    In that external seeder we:  
    1. Create the roles  
    2. Create the users  
    3. Once Identity has generated the real user IDs, we can safely establish all the dynamic relationships:  
       - department managers  
       - club leaders  
       - event organizers  
       - club enrollments  
       - event attendances  
       - achievements  
       - points and levels  

    For this reason, it is **mandatory** to resolve the DbContext first with GetRequiredService<ApplicationDbContext>()
    before calling DataSeeder.SeedAsync().
     */


    var db = services.GetRequiredService<ApplicationDbContext>();

    await DataSeeder.SeedAsync(userManager, roleManager, db);

}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();


app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");
app.MapRazorPages();

app.Run();
