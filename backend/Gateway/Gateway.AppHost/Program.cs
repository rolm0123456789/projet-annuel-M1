var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Gateway>("gateway");
builder.AddProject<Projects.ReviewService>("reviewservice");
builder.AddProject<Projects.NotificationService>("notificationservice");
builder.AddProject<Projects.SignalRService>("signalRservice");
builder.AddProject<Projects.InventoryService>("inventoryService");
builder.AddProject<Projects.OrderService>("orderService");
builder.AddProject<Projects.PaymentService>("paymentService");
builder.AddProject<Projects.ShippingService>("shippingService");
builder.AddProject<Projects.AuthService>("authService");

builder.Build().Run();
