using aethon_e3.persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace aethon_e3.persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameState> GameStates => Set<GameState>();
    public DbSet<Building> Buildings => Set<Building>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Building>()
            .HasIndex(b => new { b.GameStateId, b.X, b.Y })
            .IsUnique();
    }
}
