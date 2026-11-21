-- ============================================================
-- PACHAAGRO · Datos DEMO
-- Ejecutar con `supabase db reset` o desde el SQL Editor.
-- TODOS los registros llevan is_demo = true y se muestran con la
-- etiqueta DEMO en la interfaz. No son información oficial.
-- ============================================================

insert into public.announcements (
  id, author_id, title, slug, summary, body, type, audience_scope,
  department_id, municipality_id, community_id, crop_id,
  is_demo, is_published, published_at, expires_at
) values
  (
    '00000000-0000-4000-8000-000000000701',
    null,
    'Feria departamental de semillas nativas en Cochabamba',
    'feria-departamental-semillas-nativas-cochabamba',
    'Productores de papa, maíz y quinua podrán intercambiar semillas y recibir orientación técnica.',
    $body$La feria reúne a asociaciones de productores de los valles cochabambinos para intercambiar semillas nativas y compartir experiencias de conservación.

## Qué llevar
- Semillas seleccionadas y correctamente identificadas.
- Registro simple de procedencia y campaña agrícola.
- Recipientes limpios para el intercambio.

## Actividades
Habrá mesas de orientación sobre selección de semilla, conservación de suelos y asociatividad. La participación es gratuita y abierta a productores registrados en la plataforma.

Este contenido es de demostración y no constituye una convocatoria oficial.$body$,
    'event', 'department',
    '00000000-0000-4000-8000-000000000102', null, null, null,
    true, true, now() - interval '2 days', now() + interval '12 days'
  ),
  (
    '00000000-0000-4000-8000-000000000702',
    null,
    'Revisión preventiva de sistemas de riego antes de la campaña',
    'revision-preventiva-sistemas-riego',
    'Recomendaciones generales para revisar conducciones, reservorios y emisores antes de la temporada seca.',
    $body$Antes de iniciar la campaña, revise el recorrido completo del agua: captación, conducción, reservorio y emisores.

## Lista de verificación
- Buscar fugas y uniones flojas.
- Limpiar rejillas y filtros.
- Verificar que las válvulas abran y cierren correctamente.
- Registrar el caudal disponible en horarios de mayor demanda.

Ante dudas sobre el diseño o la capacidad del sistema, consulte con un técnico de su municipio. Esta es una guía general de demostración, no una instrucción oficial.$body$,
    'communique', 'national',
    null, null, null, null,
    true, true, now() - interval '4 days', null
  ),
  (
    '00000000-0000-4000-8000-000000000703',
    null,
    'Jornada de cuidado del suelo en el altiplano paceño',
    'jornada-cuidado-suelo-altiplano-paceno',
    'Encuentro comunitario sobre cobertura del suelo, rotación y manejo del agua de lluvia.',
    $body$La jornada busca compartir prácticas sencillas para conservar la humedad y reducir la erosión en parcelas de altura.

## Temas
- Cobertura con rastrojos.
- Rotación de cultivos.
- Pequeñas obras de retención de agua.
- Observación de la salud del suelo.

Se recomienda llevar muestras de suelo de su parcela para observarlas en grupo. Actividad demo sin carácter oficial.$body$,
    'event', 'community',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000301',
    null,
    true, true, now() - interval '1 day', now() + interval '9 days'
  ),
  (
    '00000000-0000-4000-8000-000000000704',
    null,
    'Disponibilidad de asistencia técnica para productores de cacao',
    'asistencia-tecnica-productores-cacao',
    'Visitas de orientación para parcelas de cacao en la región amazónica, con cupos limitados.',
    $body$Un equipo técnico acompañará parcelas de cacao para revisar sombra, poda sanitaria y manejo de residuos de cosecha.

## Cómo solicitar la visita
Registre su interés en la plataforma y actualice sus cultivos en el perfil. El equipo priorizará parcelas de productores con registro completo.

Actividad de demostración. Los cupos y fechas deben confirmarse con la asociación organizadora.$body$,
    'announcement', 'crop',
    null, null, null,
    '00000000-0000-4000-8000-000000000404',
    true, true, now() - interval '6 days', now() + interval '20 days'
  ),
  (
    '00000000-0000-4000-8000-000000000705',
    null,
    'Recordatorio: actualice sus cultivos de interés',
    'recordatorio-actualice-cultivos',
    'Mantener sus cultivos actualizados permite recibir alertas y contenidos más pertinentes.',
    $body$Ingrese a su perfil y confirme sus cultivos de interés, departamento y municipio.

La información permite filtrar comunicados y contenidos educativos. No compartimos sus datos con terceros ajenos a la operación de la plataforma.$body$,
    'announcement', 'national',
    null, null, null, null,
    true, true, now() - interval '9 days', null
  ),
  (
    '00000000-0000-4000-8000-000000000706',
    null,
    'Comunicado de la asociación de productores de Punata',
    'comunicado-asociacion-punata',
    'Convocatoria a reunión de coordinación para la campaña de maíz.',
    $body$Se convoca a las familias productoras de la comunidad de San Benito a una reunión de coordinación.

## Orden del día
- Balance de la campaña anterior.
- Calendarización de siembra.
- Organización del riego comunitario.
- Consultas y acuerdos.

Comunicado de demostración emitido por una asociación ficticia.$body$,
    'meeting', 'community',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000214',
    '00000000-0000-4000-8000-000000000303',
    null,
    true, true, now() - interval '3 days', now() + interval '4 days'
  )
on conflict (id) do nothing;

insert into public.meetings (
  id, author_id, title, description, starts_at, ends_at, location,
  is_virtual, virtual_url, department_id, municipality_id, community_id,
  crop_id, is_demo
) values
  (
    '00000000-0000-4000-8000-000000000801', null,
    'Reunión de coordinación de la campaña de papa',
    'Encuentro de productores y asociación para coordinar siembra, riego y compra conjunta de insumos.',
    now() + interval '2 days', now() + interval '2 days 2 hours',
    'Casa comunal de Aroma, Patacamaya', false, null,
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000401', true
  ),
  (
    '00000000-0000-4000-8000-000000000802', null,
    'Taller virtual: lectura de pronósticos y organización del riego',
    'Sesión introductoria para interpretar pronósticos y planificar el uso del agua en la parcela.',
    now() + interval '5 days', now() + interval '5 days 1 hour',
    'En línea', true, 'https://meet.example.org/pachaagro-riego',
    null, null, null, null, true
  ),
  (
    '00000000-0000-4000-8000-000000000803', null,
    'Asamblea de la asociación de cacao de San Julián',
    'Revisión de acuerdos de cosecha, fermentado y transporte conjunto.',
    now() + interval '8 days', now() + interval '8 days 3 hours',
    'Salón municipal de San Julián', false, null,
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000225',
    '00000000-0000-4000-8000-000000000305',
    '00000000-0000-4000-8000-000000000404', true
  ),
  (
    '00000000-0000-4000-8000-000000000804', null,
    'Feria de intercambio de semillas de quinua',
    'Espacio de intercambio y conversación sobre variedades locales de quinua.',
    now() - interval '6 days', now() - interval '6 days' + interval '5 hours',
    'Plaza principal de Challapata', false, null,
    '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000232',
    null,
    '00000000-0000-4000-8000-000000000402', true
  )
on conflict (id) do nothing;

insert into public.weather_alerts (
  id, author_id, title, description, severity, source, starts_at, ends_at,
  department_id, municipality_id, community_id, is_demo, is_active
) values
  (
    '00000000-0000-4000-8000-000000000901', null,
    'Posibles heladas nocturnas en el altiplano',
    'Condiciones favorables a descenso de temperatura durante la madrugada. Proteja plántulas y cultivos sensibles. Alerta DEMO, no emitida por una autoridad oficial.',
    'moderate', 'DEMO · Centro de alertas PACHAAGRO',
    now() - interval '1 day', now() + interval '2 days',
    '00000000-0000-4000-8000-000000000101', null, null, true, true
  ),
  (
    '00000000-0000-4000-8000-000000000902', null,
    'Lluvias intensas previstas en el trópico cochabambino',
    'Se recomienda revisar drenajes y asegurar insumos almacenados. Alerta DEMO con fines de demostración.',
    'severe', 'DEMO · Centro de alertas PACHAAGRO',
    now() - interval '1 day', now() + interval '1 day',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000213',
    null, true, true
  ),
  (
    '00000000-0000-4000-8000-000000000903', null,
    'Vientos moderados en los llanos orientales',
    'Ráfagas que podrían afectar estructuras livianas y cultivos jóvenes. Alerta DEMO.',
    'info', 'DEMO · Centro de alertas PACHAAGRO',
    now(), now() + interval '2 days',
    '00000000-0000-4000-8000-000000000103', null, null, true, true
  )
on conflict (id) do nothing;

insert into public.educational_contents (
  id, author_id, title, slug, summary, body, category_id, crop_id,
  department_id, content_type, reading_minutes, source_notes,
  is_demo, is_published
) values
  (
    '00000000-0000-4000-8000-000000001001', null,
    'Cómo preparar la siembra de papa en el altiplano',
    'preparar-siembra-papa-altiplano',
    'Pasos generales para planificar la siembra, seleccionar semilla y preparar el terreno.',
    $body$La papa es un cultivo central en la agricultura familiar del altiplano. Una buena planificación reduce riesgos y mejora el uso de recursos.

## Antes de sembrar
- Revise la humedad del suelo y el pronóstico disponible.
- Seleccione semilla sana, de tamaño uniforme y procedencia conocida.
- Prepare surcos según la pendiente para reducir la erosión.

## Durante la siembra
Mantenga una distancia adecuada entre plantas para facilitar el aporque y la ventilación. Registre la variedad, la fecha y la parcela.

## Después de sembrar
Observe el desarrollo del cultivo y anote cualquier cambio extraño. Consulte con su técnico local antes de aplicar productos.$body$,
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000101', 'guide', 5,
    'Material DEMO de orientación general. Validar con el servicio técnico municipal o asociación local.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001002', null,
    'Calendario agrícola referencial para el valle cochabambino',
    'calendario-agricola-valle-cochabambino',
    'Una vista general de las temporadas de trabajo y la importancia de ajustar el calendario al clima local.',
    $body$Los calendarios agrícolas son orientativos. La altitud, la variedad y las condiciones del año modifican las fechas de siembra y cosecha.

## Temporadas
- Época de lluvias: planificación de siembra y reserva de agua.
- Transición: control de malezas y observación de plagas.
- Época seca: cosecha, almacenamiento y preparación del suelo.

Use este calendario como referencia y contrástelo con la observación de su parcela y el pronóstico local.$body$,
    '00000000-0000-4000-8000-000000000503', null,
    '00000000-0000-4000-8000-000000000102', 'calendar', 4,
    'Calendario DEMO referencial. No sustituye asistencia técnica local.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001003', null,
    'Señales tempranas de problemas en el cultivo de maíz',
    'senales-tempranas-problemas-maiz',
    'Qué observar en hojas, tallos y mazorcas para detectar problemas a tiempo.',
    $body$La observación frecuente permite detectar cambios antes de que afecten la producción.

## Qué revisar
- Color y forma de las hojas.
- Presencia de insectos o daños en el envés.
- Estado de la base del tallo.
- Desarrollo y llenado de la mazorca.

## Buenas prácticas de observación
Recorra la parcela en zigzag y revise plantas en distintos puntos. Anote fechas y tome fotografías. Si identifica un problema, consulte a un técnico antes de aplicar tratamientos.$body$,
    '00000000-0000-4000-8000-000000000505',
    '00000000-0000-4000-8000-000000000403',
    null, 'crop_info', 4,
    'Contenido DEMO educativo general. No es un diagnóstico fitosanitario.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001004', null,
    'Cobertura del suelo con rastrojos: una práctica de conservación',
    'cobertura-suelo-rastrojos',
    'Cómo usar residuos de cosecha para proteger el suelo y conservar humedad.',
    $body$Mantener el suelo cubierto reduce el impacto de la lluvia y la pérdida de humedad por evaporación.

## Pasos generales
- Deje una parte de los rastrojos en el campo.
- Distribuya la cobertura de forma uniforme.
- Evite amontonar residuos que puedan favorecer problemas sanitarios.
- Combine la cobertura con rotación de cultivos cuando sea posible.

La cantidad adecuada depende del cultivo, el clima y la disponibilidad de residuos. Consulte con su servicio técnico local.$body$,
    '00000000-0000-4000-8000-000000000507', null,
    null, 'soil', 3,
    'Práctica DEMO de conservación de suelos. Ajustar a condiciones locales.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001005', null,
    'Manejo integrado de plagas: principios básicos',
    'manejo-integrado-plagas-principios',
    'Combinar observación, prevención y control responsable antes de recurrir a productos.',
    $body$El manejo integrado de plagas prioriza la prevención y la observación.

## Principios
- Identificar correctamente la plaga antes de actuar.
- Revisar la parcela con frecuencia.
- Favorecer enemigos naturales y diversidad en el entorno.
- Usar controles químicos solo cuando sea necesario y siguiendo la etiqueta y la normativa vigente.

No improvise mezclas ni dosis. Solicite orientación a un profesional autorizado.$body$,
    '00000000-0000-4000-8000-000000000504', null,
    null, 'pest', 4,
    'Contenido DEMO de carácter general. No reemplaza la recomendación de un ingeniero agrónomo.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001006', null,
    'Ficha de cultivo: quinua',
    'ficha-cultivo-quinua',
    'Requerimientos generales, ciclo y consideraciones de manejo de la quinua.',
    $body$La quinua se adapta a condiciones de altura y suelos bien drenados.

## Aspectos generales
- Tolera periodos de sequía, pero responde al riego oportuno.
- Prefiere suelos sueltos y con buen drenaje.
- Es sensible al exceso de humedad en etapas tempranas.

## Registro recomendado
Anote variedad, fecha de siembra, densidad y ocurrencia de eventos climáticos. Esa información ayuda a tomar mejores decisiones en la siguiente campaña.$body$,
    '00000000-0000-4000-8000-000000000508',
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000104', 'crop_info', 3,
    'Ficha DEMO de referencia. Validar variedades y manejo con especialistas locales.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001007', null,
    'Buenas prácticas de cosecha y poscosecha de café',
    'buenas-practicas-cosecha-poscosecha-cafe',
    'Recomendaciones generales para mejorar la calidad del grano y reducir pérdidas.',
    $body$La calidad del café depende de una cosecha oportuna y un manejo cuidadoso del grano.

## Cosecha
- Recoja solo frutos maduros.
- Evite mezclar frutos verdes o dañados.
- Mantenga limpios los recipientes y herramientas.

## Poscosecha
- Clasifique y procese el grano lo antes posible.
- Mantenga el secado uniforme y protegido de la humedad.
- Registre fechas y lotes para dar trazabilidad.

Consulte protocolos específicos de su cooperativa o comprador.$body$,
    '00000000-0000-4000-8000-000000000506',
    '00000000-0000-4000-8000-000000000405',
    '00000000-0000-4000-8000-000000000101', 'good_practice', 5,
    'Guía DEMO de buenas prácticas generales.',
    true, true
  ),
  (
    '00000000-0000-4000-8000-000000001008', null,
    'Riego eficiente en huertos familiares',
    'riego-eficiente-huertos-familiares',
    'Ideas prácticas para usar mejor el agua en parcelas pequeñas.',
    $body$En huertos familiares, pequeños cambios en la forma de regar pueden ahorrar agua y mejorar el desarrollo de las plantas.

## Recomendaciones generales
- Riegue temprano o al final del día.
- Priorice el riego en la zona de raíces.
- Use cobertura para reducir la evaporación.
- Revise fugas y ajuste los tiempos de riego.

Observe la respuesta de sus cultivos y ajuste según el clima y el tipo de suelo.$body$,
    '00000000-0000-4000-8000-000000000502', null,
    null, 'care', 3,
    'Contenido DEMO de orientación general.',
    true, true
  )
on conflict (id) do nothing;
