using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace aethon_e3.persistence.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "GameStates",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Round = table.Column<int>(type: "integer", nullable: false),
                Population = table.Column<int>(type: "integer", nullable: false),
                ConsumerGoods = table.Column<int>(type: "integer", nullable: false),
                Industry = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_GameStates", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Buildings",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                GameStateId = table.Column<int>(type: "integer", nullable: false),
                X = table.Column<int>(type: "integer", nullable: false),
                Y = table.Column<int>(type: "integer", nullable: false),
                Type = table.Column<int>(type: "integer", nullable: false),
                IsNewlyBuilt = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Buildings", x => x.Id);
                table.ForeignKey(
                    name: "FK_Buildings_GameStates_GameStateId",
                    column: x => x.GameStateId,
                    principalTable: "GameStates",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Buildings_GameStateId_X_Y",
            table: "Buildings",
            columns: new[] { "GameStateId", "X", "Y" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Buildings");
        migrationBuilder.DropTable(name: "GameStates");
    }
}
