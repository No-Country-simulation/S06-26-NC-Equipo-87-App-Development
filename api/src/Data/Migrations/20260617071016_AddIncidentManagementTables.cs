using Microsoft.EntityFrameworkCore.Migrations;

using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddIncidentManagementTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Areas",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Areas", x => x.Id));

        migrationBuilder.CreateTable(
            name: "IncidentTypes",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_IncidentTypes", x => x.Id));

        migrationBuilder.CreateTable(
            name: "SeverityTypes",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_SeverityTypes", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Incidents",
            columns: table => new
            {
                IncidentId = table.Column<string>(type: "text", nullable: false),
                Description = table.Column<string>(type: "text", nullable: false),
                AreaId = table.Column<int>(type: "integer", nullable: false),
                IncidentTypeId = table.Column<int>(type: "integer", nullable: false),
                SeverityTypeId = table.Column<int>(type: "integer", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Incidents", x => x.IncidentId);
                table.ForeignKey(
                    name: "FK_Incidents_Areas_AreaId",
                    column: x => x.AreaId,
                    principalTable: "Areas",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Incidents_IncidentTypes_IncidentTypeId",
                    column: x => x.IncidentTypeId,
                    principalTable: "IncidentTypes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Incidents_SeverityTypes_SeverityTypeId",
                    column: x => x.SeverityTypeId,
                    principalTable: "SeverityTypes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "IncidentStatusHistories",
            columns: table => new
            {
                HistoryId = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                IncidentId = table.Column<string>(type: "text", nullable: false),
                PreviousStatus = table.Column<string>(type: "text", nullable: true),
                NewStatus = table.Column<string>(type: "text", nullable: false),
                TransitionNotes = table.Column<string>(type: "text", nullable: true),
                ChangedByUserId = table.Column<string>(type: "text", nullable: false),
                ChangedDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_IncidentStatusHistories", x => x.HistoryId);
                table.ForeignKey(
                    name: "FK_IncidentStatusHistories_Incidents_IncidentId",
                    column: x => x.IncidentId,
                    principalTable: "Incidents",
                    principalColumn: "IncidentId",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_IncidentStatusHistories_Users_ChangedByUserId",
                    column: x => x.ChangedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.InsertData(
            table: "Areas",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[,]
            {
                { 1, "Zona Norte", "Active" },
                { 2, "Línea 3", "Active" },
                { 3, "Almacén", "Active" },
                { 4, "Calidad", "Active" }
            });

        migrationBuilder.InsertData(
            table: "IncidentTypes",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[,]
            {
                { 1, "Falla mecánica", "Active" },
                { 2, "Accidente", "Active" },
                { 3, "Calidad", "Active" },
                { 4, "Otro", "Active" }
            });

        migrationBuilder.InsertData(
            table: "SeverityTypes",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[,]
            {
                { 1, "Alto", "Active" },
                { 2, "Medio", "Active" },
                { 3, "Bajo", "Active" }
            });

        migrationBuilder.CreateIndex(
            name: "IX_Incidents_AreaId",
            table: "Incidents",
            column: "AreaId");

        migrationBuilder.CreateIndex(
            name: "IX_Incidents_IncidentTypeId",
            table: "Incidents",
            column: "IncidentTypeId");

        migrationBuilder.CreateIndex(
            name: "IX_Incidents_SeverityTypeId",
            table: "Incidents",
            column: "SeverityTypeId");

        migrationBuilder.CreateIndex(
            name: "IX_IncidentStatusHistories_ChangedByUserId",
            table: "IncidentStatusHistories",
            column: "ChangedByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_IncidentStatusHistories_IncidentId",
            table: "IncidentStatusHistories",
            column: "IncidentId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "IncidentStatusHistories");

        migrationBuilder.DropTable(
            name: "Incidents");

        migrationBuilder.DropTable(
            name: "Areas");

        migrationBuilder.DropTable(
            name: "IncidentTypes");

        migrationBuilder.DropTable(
            name: "SeverityTypes");
    }
}
