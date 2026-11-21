-- ============================================================
-- PACHAAGRO · Datos de referencia (no son datos DEMO)
-- Departamentos, municipios, comunidades, cultivos y categorías.
-- ============================================================

insert into public.departments (id, name, code, slug, latitude, longitude) values
  ('00000000-0000-4000-8000-000000000101', 'La Paz', 'LP', 'la-paz', -16.5, -68.15),
  ('00000000-0000-4000-8000-000000000102', 'Cochabamba', 'CB', 'cochabamba', -17.393, -66.157),
  ('00000000-0000-4000-8000-000000000103', 'Santa Cruz', 'SC', 'santa-cruz', -17.783, -63.182),
  ('00000000-0000-4000-8000-000000000104', 'Oruro', 'OR', 'oruro', -17.964, -67.106),
  ('00000000-0000-4000-8000-000000000105', 'Potosí', 'PT', 'potosi', -19.573, -65.754),
  ('00000000-0000-4000-8000-000000000106', 'Chuquisaca', 'CH', 'chuquisaca', -19.033, -65.263),
  ('00000000-0000-4000-8000-000000000107', 'Tarija', 'TJ', 'tarija', -21.535, -64.729),
  ('00000000-0000-4000-8000-000000000108', 'Beni', 'BN', 'beni', -14.833, -64.9),
  ('00000000-0000-4000-8000-000000000109', 'Pando', 'PD', 'pando', -11.026, -68.769)
on conflict (id) do nothing;

insert into public.municipalities (id, department_id, name, slug, latitude, longitude) values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'La Paz', 'la-paz', -16.5, -68.15),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', 'El Alto', 'el-alto', -16.5, -68.2),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000101', 'Achocalla', 'achocalla', -16.58, -68.16),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000101', 'Patacamaya', 'patacamaya', -17.24, -67.92),
  ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000102', 'Cochabamba', 'cochabamba', -17.393, -66.157),
  ('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000102', 'Quillacollo', 'quillacollo', -17.392, -66.278),
  ('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000102', 'Sacaba', 'sacaba', -17.404, -66.038),
  ('00000000-0000-4000-8000-000000000214', '00000000-0000-4000-8000-000000000102', 'Punata', 'punata', -17.542, -65.835),
  ('00000000-0000-4000-8000-000000000215', '00000000-0000-4000-8000-000000000102', 'Aiquile', 'aiquile', -18.204, -65.18),
  ('00000000-0000-4000-8000-000000000221', '00000000-0000-4000-8000-000000000103', 'Santa Cruz de la Sierra', 'santa-cruz-de-la-sierra', -17.783, -63.182),
  ('00000000-0000-4000-8000-000000000222', '00000000-0000-4000-8000-000000000103', 'Montero', 'montero', -17.339, -63.256),
  ('00000000-0000-4000-8000-000000000223', '00000000-0000-4000-8000-000000000103', 'Warnes', 'warnes', -17.514, -63.167),
  ('00000000-0000-4000-8000-000000000224', '00000000-0000-4000-8000-000000000103', 'Camiri', 'camiri', -20.038, -63.523),
  ('00000000-0000-4000-8000-000000000225', '00000000-0000-4000-8000-000000000103', 'San Julián', 'san-julian', -17.03, -62.71),
  ('00000000-0000-4000-8000-000000000231', '00000000-0000-4000-8000-000000000104', 'Oruro', 'oruro', -17.964, -67.106),
  ('00000000-0000-4000-8000-000000000232', '00000000-0000-4000-8000-000000000104', 'Challapata', 'challapata', -18.902, -66.771),
  ('00000000-0000-4000-8000-000000000233', '00000000-0000-4000-8000-000000000104', 'Huanuni', 'huanuni', -18.29, -66.84),
  ('00000000-0000-4000-8000-000000000241', '00000000-0000-4000-8000-000000000105', 'Potosí', 'potosi', -19.573, -65.754),
  ('00000000-0000-4000-8000-000000000242', '00000000-0000-4000-8000-000000000105', 'Uyuni', 'uyuni', -20.46, -66.825),
  ('00000000-0000-4000-8000-000000000243', '00000000-0000-4000-8000-000000000105', 'Villazón', 'villazon', -22.087, -65.594),
  ('00000000-0000-4000-8000-000000000244', '00000000-0000-4000-8000-000000000105', 'Betanzos', 'betanzos', -19.553, -65.454),
  ('00000000-0000-4000-8000-000000000251', '00000000-0000-4000-8000-000000000106', 'Sucre', 'sucre', -19.033, -65.263),
  ('00000000-0000-4000-8000-000000000252', '00000000-0000-4000-8000-000000000106', 'Monteagudo', 'monteagudo', -19.8, -63.95),
  ('00000000-0000-4000-8000-000000000253', '00000000-0000-4000-8000-000000000106', 'Tarabuco', 'tarabuco', -19.18, -64.91),
  ('00000000-0000-4000-8000-000000000261', '00000000-0000-4000-8000-000000000107', 'Tarija', 'tarija', -21.535, -64.729),
  ('00000000-0000-4000-8000-000000000262', '00000000-0000-4000-8000-000000000107', 'Yacuiba', 'yacuiba', -22.013, -63.677),
  ('00000000-0000-4000-8000-000000000263', '00000000-0000-4000-8000-000000000107', 'Villamontes', 'villamontes', -21.26, -63.47),
  ('00000000-0000-4000-8000-000000000271', '00000000-0000-4000-8000-000000000108', 'Trinidad', 'trinidad', -14.833, -64.9),
  ('00000000-0000-4000-8000-000000000272', '00000000-0000-4000-8000-000000000108', 'Riberalta', 'riberalta', -11.007, -66.063),
  ('00000000-0000-4000-8000-000000000273', '00000000-0000-4000-8000-000000000108', 'San Ignacio de Moxos', 'san-ignacio-de-moxos', -14.996, -65.64),
  ('00000000-0000-4000-8000-000000000281', '00000000-0000-4000-8000-000000000109', 'Cobija', 'cobija', -11.026, -68.769),
  ('00000000-0000-4000-8000-000000000282', '00000000-0000-4000-8000-000000000109', 'Porvenir', 'porvenir', -11.233, -68.667)
on conflict (id) do nothing;

insert into public.communities (id, municipality_id, name, slug) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000204', 'Aroma', 'aroma'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000204', 'Colchani', 'colchani'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000214', 'San Benito', 'san-benito'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000221', 'Paurito', 'paurito'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000221', 'Los Negros', 'los-negros'),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000251', 'Yotala', 'yotala'),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000261', 'San Jacinto', 'san-jacinto')
on conflict (id) do nothing;

insert into public.crops (id, name, slug, scientific_name, description) values
  ('00000000-0000-4000-8000-000000000401', 'Papa', 'papa', 'Solanum tuberosum', 'Cultivo andino de altura, base de la seguridad alimentaria boliviana.'),
  ('00000000-0000-4000-8000-000000000402', 'Quinua', 'quinua', 'Chenopodium quinoa', 'Grano andino de alto valor nutricional y buena tolerancia a la sequía.'),
  ('00000000-0000-4000-8000-000000000403', 'Maíz', 'maiz', 'Zea mays', 'Cereal de amplia presencia en valles y tierras bajas.'),
  ('00000000-0000-4000-8000-000000000404', 'Cacao', 'cacao', 'Theobroma cacao', 'Cultivo de sombra en la Amazonía boliviana.'),
  ('00000000-0000-4000-8000-000000000405', 'Café', 'cafe', 'Coffea arabica', 'Cultivo de altura en los Yungas y valles interandinos.'),
  ('00000000-0000-4000-8000-000000000406', 'Soya', 'soya', 'Glycine max', 'Oleaginosa de gran relevancia en el oriente boliviano.'),
  ('00000000-0000-4000-8000-000000000407', 'Arroz', 'arroz', 'Oryza sativa', 'Cultivo de tierras bajas y valles cálidos.'),
  ('00000000-0000-4000-8000-000000000408', 'Trigo', 'trigo', 'Triticum aestivum', 'Cereal de invierno en valles y altiplano.'),
  ('00000000-0000-4000-8000-000000000409', 'Cebolla', 'cebolla', 'Allium cepa', 'Hortaliza de ciclo corto muy presente en huertos familiares.'),
  ('00000000-0000-4000-8000-000000000410', 'Tomate', 'tomate', 'Solanum lycopersicum', 'Hortaliza de alto valor comercial, sensible a heladas.'),
  ('00000000-0000-4000-8000-000000000411', 'Plátano', 'platano', 'Musa paradisiaca', 'Cultivo tropical de los llanos y la Amazonía.'),
  ('00000000-0000-4000-8000-000000000412', 'Maní', 'mani', 'Arachis hypogaea', 'Leguminosa de ciclo corto cultivada en el Chaco y valles.')
on conflict (id) do nothing;

insert into public.content_categories (id, name, slug, description) values
  ('00000000-0000-4000-8000-000000000501', 'Siembra', 'siembra', 'Preparación, épocas y densidad de siembra.'),
  ('00000000-0000-4000-8000-000000000502', 'Cuidados', 'cuidados', 'Riego, nutrición y manejo general del cultivo.'),
  ('00000000-0000-4000-8000-000000000503', 'Calendario agrícola', 'calendario-agricola', 'Épocas de trabajo por cultivo y región.'),
  ('00000000-0000-4000-8000-000000000504', 'Plagas', 'plagas', 'Prevención y manejo integrado de plagas.'),
  ('00000000-0000-4000-8000-000000000505', 'Enfermedades', 'enfermedades', 'Identificación temprana y prevención.'),
  ('00000000-0000-4000-8000-000000000506', 'Buenas prácticas', 'buenas-practicas', 'Manejo responsable y trazabilidad.'),
  ('00000000-0000-4000-8000-000000000507', 'Suelo', 'suelo', 'Conservación, fertilidad y cobertura.'),
  ('00000000-0000-4000-8000-000000000508', 'Fichas de cultivo', 'fichas-de-cultivo', 'Resúmenes por cultivo y región.')
on conflict (id) do nothing;
