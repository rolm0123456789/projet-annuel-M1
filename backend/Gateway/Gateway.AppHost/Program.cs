var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Gateway>("gateway");

builder.AddProject<Projects.ReviewService>("reviewservice");

builder.AddProject<Projects.NotificationService>("notificationservice");

builder.Build().Run();
