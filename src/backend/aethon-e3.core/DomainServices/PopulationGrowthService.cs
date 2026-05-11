namespace aethon_e3.core.DomainServices;

public class PopulationGrowthService
{
    public double CalculateDelta(int population, double supply)
    {
        if (supply > 1.0)
            return population * 0.0025 * Math.Pow(supply - 1.0, 1.2);
        if (supply < 1.0)
            return -(population * 0.005 * Math.Abs(supply - 1.0));
        return 0.0;
    }
}
