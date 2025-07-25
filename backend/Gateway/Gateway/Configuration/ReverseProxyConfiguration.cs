﻿using Gateway.Resources;

namespace Gateway.Configuration
{
    /// <summary>
    /// Reverse proxy configuration.
    /// </summary>
    public static class ReverseProxyConfiguration
    {
        /// <summary>
        /// Configures this instance.
        /// </summary>
        /// <returns>Configuration.</returns>
        public static IConfiguration Configure()
            => new ConfigurationBuilder()
                .AddJsonFile(Settings.AppSettingsFileName, optional: false, reloadOnChange: true)
                .Build();
    }
}