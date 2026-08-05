namespace MediSync.Domain.Auditoria;

public record ToolCallRecord(string ToolName, string InputJson, string OutputJson);
