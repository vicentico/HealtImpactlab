namespace MediSync.AI;

public class AnthropicOptions
{
    public const string SectionName = "Anthropic";

    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "claude-sonnet-4-5";
    public string BaseUrl { get; set; } = "https://api.anthropic.com";
    public string ApiVersion { get; set; } = "2023-06-01";
    public int MaxIterations { get; set; } = 8;
}
