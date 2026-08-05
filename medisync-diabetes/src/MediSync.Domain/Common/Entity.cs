namespace MediSync.Domain.Common;

public abstract class Entity
{
    public string Id { get; protected set; } = Guid.NewGuid().ToString("N");
}

public interface IDomainEvent
{
    DateTime OcurridoEn { get; }
}
