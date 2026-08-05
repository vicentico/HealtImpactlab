using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Options;

namespace MediSync.AI;

public class AnthropicApiException(int statusCode, string body)
    : Exception($"Anthropic Messages API respondió {statusCode}: {body}")
{
    public int StatusCode { get; } = statusCode;
    public string Body { get; } = body;
}

/// <summary>
/// Cliente delgado hacia la Anthropic Messages API (https://api.anthropic.com/v1/messages).
/// No usa el SDK oficial: se implementa un HttpClient tipado + JSON crudo para mantener
/// el "motor de agentes" dentro del mismo proceso .NET (ver docs/rustyhand-analisis.md).
/// </summary>
public class AnthropicClient(HttpClient httpClient, IOptions<AnthropicOptions> options)
{
    private readonly AnthropicOptions _options = options.Value;

    public async Task<JsonObject> SendMessageAsync(JsonObject requestBody, CancellationToken ct = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl.TrimEnd('/')}/v1/messages");
        request.Headers.Add("x-api-key", _options.ApiKey);
        request.Headers.Add("anthropic-version", _options.ApiVersion);
        request.Content = new StringContent(requestBody.ToJsonString(), Encoding.UTF8, "application/json");
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await httpClient.SendAsync(request, ct);
        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new AnthropicApiException((int)response.StatusCode, responseBody);
        }

        return JsonNode.Parse(responseBody)?.AsObject()
            ?? throw new InvalidOperationException("Respuesta vacía o inválida de Anthropic Messages API.");
    }

    public string Model => _options.Model;
    public int MaxIterations => _options.MaxIterations;
}
