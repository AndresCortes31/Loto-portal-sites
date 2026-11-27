import { Router } from 'express';
import { db, findApp } from '../data/store.js';
import { includesText } from '../utils/helpers.js';

const r = Router();

r.get('/', (req, res) => {
  const { q, env } = req.query;
  const areas = db.areas
    .map((area) => ({
      ...area,
      apps: area.apps
        .map(findApp)
        .filter(Boolean)
        .filter((a) => (!env || a.env === env) && includesText(`${area.name} ${a.name} ${a.code}`, q)),
    }))
    .filter((a) => a.apps.length);
  res.json({
    items: areas,
    totalApps: areas.reduce((s, a) => s + a.apps.length, 0),
    totalAreas: areas.length,
  });
});

export default r;
