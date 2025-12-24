namespace TraductorDeSignos.Models
{
    //Trazabilidad,debug,evaluacion. Información contextual sobre cómo se creó una firma.Da mejor prestacion alineandose con el json 
    public class GestureMetadata
    {
        public DateTime FechaEntrenamiento { get; }//versionar firmar - justificar resultados
        public double TasaDeteccion { get; } //metrica objetiva de calidad para los gestos para en las estadisticas poder desde comparar versiones hasta filtrar gestos malos
        public int FramesInterpolados { get; } //indica si la firma fue modificada artificialmente
        
        public double NormaFirma { get; }//magnitud de la firma promedio para comparar energia entre gestos

        public GestureMetadata(
            DateTime fechaEntrenamiento,
            double tasaDeteccion,
            int framesInterpolados,
            double normaFirma)
        {
            FechaEntrenamiento = fechaEntrenamiento;
            TasaDeteccion = tasaDeteccion;
            FramesInterpolados = framesInterpolados;
            NormaFirma = normaFirma;
        }
    }
}
