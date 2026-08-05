using MongoDB.Bson;
using MongoDB.Bson.Serialization.Conventions;

namespace MediSync.Infrastructure.Persistence;

public static class MongoConventions
{
    private static bool _registered;
    private static readonly object Lock = new();

    /// <summary>Guarda los enums como strings legibles en Mongo en vez de enteros.</summary>
    public static void RegisterOnce()
    {
        if (_registered) return;
        lock (Lock)
        {
            if (_registered) return;
            ConventionRegistry.Register(
                "medisync-conventions",
                new ConventionPack { new EnumRepresentationConvention(BsonType.String) },
                _ => true);
            _registered = true;
        }
    }
}
