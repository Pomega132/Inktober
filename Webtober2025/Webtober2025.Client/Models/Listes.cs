using System.Runtime.ConstrainedExecution;

namespace Webtober2025.Client.Models
{
	public static class Listes
	{
		public static List<(string Name, bool Actif)> THEMES_2025 { get; } =
        [
            ("MOUSTACHE", true),
			("TISSER", true),
			("COURONNE", true),
			("TROUBLE", true),
			("CERF", true),
			("PERCER", true),
			("ÉTOILE DE MER", false),
			("IMPRUDENT", false),
			("LOURD", true),
			("BALAYER", true),
			("PIQÛRE", true),
			("DÉCHIRÉ", false),
			("BOIRE", false),
			("TRONC", true),
			("EN LAMBEAUX", false),
			("BOURDE", false),
			("ORNÉ", false),
			("ACCORD", false),
			("ARCTIQUE", false),
			("RIVAUX", false),
			("EXPLOSION", false),
			("BOUTON", true),
			("LUCIOLE", true),
			("TAPAGEUR", false),
			("ENFER", false),
			("DÉROUTANT", true),
			("OIGNON", false),
			("SQUELLETIQUE", false),
			("LEÇON", false),
			("VIDE", true),
			("RECOMPENSE", true),
		];
	}
}
