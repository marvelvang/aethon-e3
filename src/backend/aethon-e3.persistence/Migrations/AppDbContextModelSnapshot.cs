using aethon_e3.persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace aethon_e3.persistence.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "10.0.0")
            .HasAnnotation("Relational:MaxIdentifierLength", 63)
            .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

        modelBuilder.Entity("aethon_e3.persistence.Entities.Building", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            b.Property<int>("GameStateId")
                .HasColumnType("integer");

            b.Property<bool>("IsNewlyBuilt")
                .HasColumnType("boolean");

            b.Property<int>("Type")
                .HasColumnType("integer");

            b.Property<int>("X")
                .HasColumnType("integer");

            b.Property<int>("Y")
                .HasColumnType("integer");

            b.HasKey("Id");

            b.HasIndex("GameStateId", "X", "Y")
                .IsUnique();

            b.ToTable("Buildings");
        });

        modelBuilder.Entity("aethon_e3.persistence.Entities.GameState", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            b.Property<int>("ConsumerGoods")
                .HasColumnType("integer");

            b.Property<int>("Industry")
                .HasColumnType("integer");

            b.Property<int>("Population")
                .HasColumnType("integer");

            b.Property<int>("Round")
                .HasColumnType("integer");

            b.HasKey("Id");

            b.ToTable("GameStates");
        });

        modelBuilder.Entity("aethon_e3.persistence.Entities.Building", b =>
        {
            b.HasOne("aethon_e3.persistence.Entities.GameState", "GameState")
                .WithMany("Buildings")
                .HasForeignKey("GameStateId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("GameState");
        });

        modelBuilder.Entity("aethon_e3.persistence.Entities.GameState", b =>
        {
            b.Navigation("Buildings");
        });
#pragma warning restore 612, 618
    }
}
