using TraductorDeSignos.Hubs;
using TraductorDeSignos.Interfaces;
using TraductorDeSignos.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();

// Register gesture services
builder.Services.AddSingleton<IGestureSignatureService, GestureSignatureService>();
builder.Services.AddScoped<IGestureDetectorService, GestureDetectorService>();

var app = builder.Build();

//// Load gesture signatures at startup
//using (var scope = app.Services.CreateScope())
//{
//    var signatureService = scope.ServiceProvider.GetRequiredService<IGestureSignatureService>();
//    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
//    var signaturePath = Path.Combine(env.WebRootPath, "gestos", "inteligencia_firma.json");
//    await signatureService.LoadSignaturesAsync(signaturePath);
//}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();


// Map SignalR Hub
app.MapHub<CameraHub>("/cameraHub");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();