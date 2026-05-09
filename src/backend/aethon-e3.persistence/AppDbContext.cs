using Microsoft.EntityFrameworkCore;

namespace aethon_e3.persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
