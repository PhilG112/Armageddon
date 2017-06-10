namespace Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddedCountryToMeteorite : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Meteorites", "Country", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Meteorites", "Country");
        }
    }
}
