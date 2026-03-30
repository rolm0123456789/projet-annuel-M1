using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=Product.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Logging.AddConsole();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
    SeedData(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();

static void SeedData(ApplicationDbContext db)
{
    if (db.Categories.Any()) return;

    var categories = new List<CategoryModel>
    {
        new() { Name = "Smartphones",      Slug = "smartphones",    Description = "Découvrez notre sélection de smartphones dernière génération",        Image = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=400&fit=crop" },
        new() { Name = "Ordinateurs",      Slug = "computers",      Description = "Ordinateurs portables et de bureau pour tous vos besoins",             Image = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop" },
        new() { Name = "Audio",            Slug = "audio",          Description = "Écouteurs, casques et systèmes audio haute qualité",                   Image = "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=400&fit=crop" },
        new() { Name = "Gaming",           Slug = "gaming",         Description = "Consoles, jeux et accessoires gaming",                                 Image = "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=400&fit=crop" },
        new() { Name = "Tablettes",        Slug = "tablets",        Description = "Tablettes pour le travail et le divertissement",                       Image = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=400&fit=crop" },
        new() { Name = "Wearables",        Slug = "wearables",      Description = "Montres connectées et accessoires intelligents",                       Image = "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=400&fit=crop" },
        new() { Name = "TV & Vidéo",       Slug = "tv-video",       Description = "Téléviseurs, projecteurs et équipements vidéo",                        Image = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=400&fit=crop" },
        new() { Name = "Photo",            Slug = "photo",          Description = "Appareils photo, objectifs et accessoires photo",                      Image = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop" },
        new() { Name = "Maison connectée", Slug = "smart-home",     Description = "Objets connectés et domotique pour votre maison",                     Image = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop" },
        new() { Name = "Accessoires",      Slug = "accessories",    Description = "Coques, chargeurs, câbles et autres accessoires",                     Image = "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=400&fit=crop" },
        new() { Name = "Stockage",         Slug = "storage",        Description = "Disques durs, SSD et solutions de stockage",                          Image = "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=400&fit=crop" },
        new() { Name = "Réseau",           Slug = "network",        Description = "Routeurs, switches et équipements réseau",                             Image = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=400&fit=crop" },
    };

    db.Categories.AddRange(categories);
    db.SaveChanges();

    if (db.Products.Any()) return;

    var now = DateTime.UtcNow;
    var products = new List<ProductModel>
    {
        // Smartphones
        new() { Name = "iPhone 15 Pro", Description = "Le dernier iPhone avec puce A17 Pro, titane et appareil photo 48MP.", Price = 129900, Image = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&fit=crop", Images = [], Category = "Smartphones", CategoryId = "smartphones", Brand = "Apple", StockQuantity = 42, Tags = ["apple","5g","pro"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },
        new() { Name = "Samsung Galaxy S24", Description = "Galaxy AI intégré, écran Dynamic AMOLED 2X, 200MP.", Price = 109900, Image = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&fit=crop", Images = [], Category = "Smartphones", CategoryId = "smartphones", Brand = "Samsung", StockQuantity = 35, Tags = ["samsung","5g","galaxy"], IsOnSale = true, Discount = 10, CreatedAt = now, UpdatedAt = now },
        new() { Name = "Google Pixel 8", Description = "IA Google, appareil photo exceptionnel, 7 ans de mises à jour.", Price = 79900, Image = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&fit=crop", Images = [], Category = "Smartphones", CategoryId = "smartphones", Brand = "Google", StockQuantity = 20, Tags = ["google","android","ai"], IsOnSale = true, Discount = 15, CreatedAt = now, UpdatedAt = now },

        // Ordinateurs
        new() { Name = "MacBook Pro 14\"", Description = "Puce M3 Pro, 18 Go RAM, SSD 512 Go, écran Liquid Retina XDR.", Price = 209900, Image = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&fit=crop", Images = [], Category = "Ordinateurs", CategoryId = "computers", Brand = "Apple", StockQuantity = 18, Tags = ["apple","m3","pro"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },
        new() { Name = "Dell XPS 15", Description = "Intel Core i7, 32 Go RAM, RTX 4060, écran OLED 3.5K.", Price = 189900, Image = "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&fit=crop", Images = [], Category = "Ordinateurs", CategoryId = "computers", Brand = "Dell", StockQuantity = 12, Tags = ["dell","intel","oled"], IsOnSale = true, Discount = 8, CreatedAt = now, UpdatedAt = now },

        // Audio
        new() { Name = "Sony WH-1000XM5", Description = "Casque à réduction de bruit leader du marché, 30h d'autonomie.", Price = 34900, Image = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&fit=crop", Images = [], Category = "Audio", CategoryId = "audio", Brand = "Sony", StockQuantity = 55, Tags = ["anc","bluetooth","sony"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },
        new() { Name = "AirPods Pro 2", Description = "Réduction de bruit active H2, audio spatial personnalisé, USB-C.", Price = 27900, Image = "https://images.unsplash.com/photo-1588423771073-b8903fead714?w=600&fit=crop", Images = [], Category = "Audio", CategoryId = "audio", Brand = "Apple", StockQuantity = 60, Tags = ["apple","anc","earbuds"], IsOnSale = true, Discount = 12, CreatedAt = now, UpdatedAt = now },

        // Gaming
        new() { Name = "PlayStation 5", Description = "Console nouvelle génération, SSD ultra-rapide, ray tracing 4K.", Price = 54999, Image = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&fit=crop", Images = [], Category = "Gaming", CategoryId = "gaming", Brand = "Sony", StockQuantity = 8, Tags = ["ps5","console","4k"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },
        new() { Name = "Xbox Series X", Description = "4K à 120fps, Game Pass, rétrocompatibilité totale.", Price = 49999, Image = "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&fit=crop", Images = [], Category = "Gaming", CategoryId = "gaming", Brand = "Microsoft", StockQuantity = 15, Tags = ["xbox","console","gamepass"], IsOnSale = true, Discount = 5, CreatedAt = now, UpdatedAt = now },

        // Tablettes
        new() { Name = "iPad Pro 12.9\"", Description = "Puce M2, écran mini-LED ProMotion 120Hz, connecteur USB 4.", Price = 119900, Image = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&fit=crop", Images = [], Category = "Tablettes", CategoryId = "tablets", Brand = "Apple", StockQuantity = 25, Tags = ["apple","m2","pro"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },

        // Wearables
        new() { Name = "Apple Watch Series 9", Description = "Double tap, puce S9, écran toujours actif, Crash Detection.", Price = 44900, Image = "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&fit=crop", Images = [], Category = "Wearables", CategoryId = "wearables", Brand = "Apple", StockQuantity = 38, Tags = ["apple","watch","health"], IsOnSale = true, Discount = 10, CreatedAt = now, UpdatedAt = now },

        // TV & Vidéo
        new() { Name = "LG OLED C3 65\"", Description = "OLED evo, 4K 120Hz, Dolby Vision IQ, WebOS 23.", Price = 169900, Image = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&fit=crop", Images = [], Category = "TV & Vidéo", CategoryId = "tv-video", Brand = "LG", StockQuantity = 6, Tags = ["oled","4k","dolby"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },

        // Photo
        new() { Name = "Sony Alpha A7 IV", Description = "Capteur 33MP, 4K 60p, autofocus hybride, boîtier full-frame.", Price = 259900, Image = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&fit=crop", Images = [], Category = "Photo", CategoryId = "photo", Brand = "Sony", StockQuantity = 9, Tags = ["sony","fullframe","mirrorless"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },

        // Maison connectée
        new() { Name = "Google Nest Hub 2", Description = "Écran connecté 7\", Soli sleep sensing, Google Assistant.", Price = 9999, Image = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop", Images = [], Category = "Maison connectée", CategoryId = "smart-home", Brand = "Google", StockQuantity = 47, Tags = ["google","smarthome","hub"], IsOnSale = true, Discount = 20, CreatedAt = now, UpdatedAt = now },

        // Accessoires
        new() { Name = "Anker MagSafe 3-en-1", Description = "Charge simultanée iPhone, Apple Watch et AirPods, 15W MagSafe.", Price = 8999, Image = "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&fit=crop", Images = [], Category = "Accessoires", CategoryId = "accessories", Brand = "Anker", StockQuantity = 80, Tags = ["magsafe","charger","wireless"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },

        // Stockage
        new() { Name = "Samsung 990 Pro 2To", Description = "SSD NVMe M.2, lectures 7450 Mo/s, pour PS5 et PC.", Price = 17999, Image = "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&fit=crop", Images = [], Category = "Stockage", CategoryId = "storage", Brand = "Samsung", StockQuantity = 33, Tags = ["ssd","nvme","ps5"], IsOnSale = true, Discount = 18, CreatedAt = now, UpdatedAt = now },

        // Réseau
        new() { Name = "Asus ROG Rapture GT-BE98", Description = "Routeur WiFi 7, tri-bande, 25 Gbps, idéal gaming.", Price = 59900, Image = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&fit=crop", Images = [], Category = "Réseau", CategoryId = "network", Brand = "Asus", StockQuantity = 11, Tags = ["wifi7","gaming","router"], IsOnSale = false, Discount = 0, CreatedAt = now, UpdatedAt = now },
    };

    db.Products.AddRange(products);
    db.SaveChanges();
}
