namespace TraductorDeSignos.Models
{
    //Conoce el algoritmo y la definicion
    public class GestureSignature
    {
        public string Nombre { get; }// que es el gesto
        public string Tipo { get; }//si es estatico/ dinamico ,monomanual/bimanual
        public int Manos { get; }//cuantas manos hay
        public int Dimensiones { get; }//control de coherencia de mates evitando errores silenciosas
        public int FramesTotales { get; }//indica tamaño real de dataset
        public int Desplazamientos { get; }//numero real de vectores usados reflejando duracion

        public double Sigma { get; }//Variabilidad interna del gesto clave para el umbral estabilidad y fiabilidad
        public double K { get; }//Parámetro de calibración del umbral.Permite turning sin recompilar y ajustes por gesto
        public double Umbral { get; }//Valor de decisión final hace el sistema determinista y explicable 
        public double UmbralPorcentaje { get; } //Representación humana del umbral

        public double[] FirmaPromedio { get; }//Es la huella matemática del gesto.Se compara contra el gesto observado.Independiente de lenguaje y framework

        public string Descripcion { get; }//contexto del gesto
        public string Version { get; }//para hacer versionado

        public GestureMetadata Metadata { get; }//une las mates con el contexto

        public GestureSignature(
            string nombre,
            string tipo,
            int manos,
            int dimensiones,
            int framesTotales,
            int desplazamientos,
            double sigma,
            double k,
            double umbral,
            double umbralPorcentaje,
            double[] firmaPromedio,
            string descripcion,
            string version,
            GestureMetadata metadata)
        {
            Nombre = nombre;
            Tipo = tipo;
            Manos = manos;
            Dimensiones = dimensiones;
            FramesTotales = framesTotales;
            Desplazamientos = desplazamientos;
            Sigma = sigma;
            K = k;
            Umbral = umbral;
            UmbralPorcentaje = umbralPorcentaje;
            FirmaPromedio = firmaPromedio;
            Descripcion = descripcion;
            Version = version;
            Metadata = metadata;
        }
    }
}
