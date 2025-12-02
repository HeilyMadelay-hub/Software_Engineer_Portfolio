using Business_School.Data;
using Business_School.Models;
using Business_School.Services;
using Business_School.Services.Recommendation;
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

// Evitar redirecciones personalizadas que pueden abrir otra pestaña
builder.Services.ConfigureApplicationCookie(options =>
{
 options.LoginPath = "/Account/Login"; // comportamiento por defecto de Identity
});

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope()) {
 var services = scope.ServiceProvider;
 var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
 var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();
 var db = services.GetRequiredService<ApplicationDbContext>();
 await DataSeeder.SeedAsync(userManager, roleManager, db);
}

if (app.Environment.IsDevelopment())
{
 app.UseMigrationsEndPoint();
}
else
{
 app.UseExceptionHandler("/Home/Error");
 app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Usa Home/Index como raíz y HomeController redirige a Account/Login
app.MapControllerRoute(
 name: "default",
 pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
