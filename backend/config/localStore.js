const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'local_db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], analyses: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { users: [], analyses: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

class LocalUser {
  static async create({ name, email, password, role = 'user' }) {
    const db = readDB();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      _id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    return this._wrap(user);
  }

  static findOne(query) {
    const db = readDB();
    let found = null;
    if (query.email) {
      found = db.users.find(u => u.email.toLowerCase() === query.email.toLowerCase());
    } else if (query._id) {
      found = db.users.find(u => u._id.toString() === query._id.toString());
    }
    const doc = found ? this._wrap(found) : null;
    return {
      select(field) {
        if (doc && field && field.includes('-password')) {
          delete doc.password;
        }
        return this;
      },
      then(resolve) { resolve(doc); },
      catch(reject) {}
    };
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static _wrap(raw) {
    const doc = { ...raw };
    doc.id = doc._id;
    doc.matchPassword = async function (entered) {
      return await bcrypt.compare(entered, raw.password);
    };
    doc.save = async function () {
      const db = readDB();
      const idx = db.users.findIndex(u => u._id.toString() === doc._id.toString());
      if (idx !== -1) {
        doc.updatedAt = new Date().toISOString();
        db.users[idx] = { ...doc };
        writeDB(db);
      }
      return doc;
    };
    doc.select = function () { return doc; };
    return doc;
  }
}

class LocalAnalysis {
  static async create(data) {
    const db = readDB();
    const doc = {
      _id: 'anl_' + Date.now() + Math.random().toString(36).substring(2, 7),
      ...data,
      reviewStatus: data.reviewStatus || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.analyses.unshift(doc);
    writeDB(db);
    return this._wrap(doc);
  }

  static find(query = {}) {
    const db = readDB();
    let filtered = db.analyses.filter(item => {
      if (query.userId && item.userId.toString() !== query.userId.toString()) return false;
      if (query.isHealthy !== undefined && item.isHealthy !== query.isHealthy) return false;
      if (typeof query.reviewStatus === 'string' && item.reviewStatus !== query.reviewStatus) return false;
      if (query.reviewStatus && query.reviewStatus.$in && !query.reviewStatus.$in.includes(item.reviewStatus)) return false;
      if (query.plantName && !new RegExp(query.plantName, 'i').test(item.plantName)) return false;
      if (query.$or) {
        const matches = query.$or.some(clause => {
          if (clause.plantName && new RegExp(clause.plantName.$regex, 'i').test(item.plantName)) return true;
          if (clause.predictedDisease && new RegExp(clause.predictedDisease.$regex, 'i').test(item.predictedDisease)) return true;
          if (clause.originalFilename && new RegExp(clause.originalFilename.$regex, 'i').test(item.originalFilename)) return true;
          return false;
        });
        if (!matches) return false;
      }
      return true;
    });

    const chain = {
      _data: filtered,
      sort(sortObj) {
        const key = Object.keys(sortObj)[0] || 'createdAt';
        const dir = sortObj[key] === 1 ? 1 : -1;
        this._data.sort((a, b) => {
          if (a[key] < b[key]) return -1 * dir;
          if (a[key] > b[key]) return 1 * dir;
          return 0;
        });
        return this;
      },
      skip(n) {
        this._data = this._data.slice(n);
        return this;
      },
      limit(n) {
        this._data = this._data.slice(0, n);
        return this;
      },
      then(resolve) {
        resolve(this._data.map(d => LocalAnalysis._wrap(d)));
      }
    };
    return chain;
  }

  static async findById(id) {
    const db = readDB();
    const found = db.analyses.find(a => a._id.toString() === id.toString());
    return found ? this._wrap(found) : null;
  }

  static async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  static async aggregate(pipeline = []) {
    const db = readDB();
    let items = [...db.analyses];
    
    for (const stage of pipeline) {
      if (stage.$match) {
        const m = stage.$match;
        items = items.filter(it => {
          if (m.userId && it.userId.toString() !== m.userId.toString()) return false;
          return true;
        });
      } else if (stage.$group) {
        if (stage.$group._id === null && stage.$group.avgConfidence) {
          if (items.length === 0) return [];
          const sum = items.reduce((acc, it) => acc + (it.confidence || 0), 0);
          return [{ _id: null, avgConfidence: sum / items.length }];
        } else if (stage.$group._id === '$reviewStatus') {
          const counts = {};
          items.forEach(it => {
            const st = it.reviewStatus || 'Pending';
            counts[st] = (counts[st] || 0) + 1;
          });
          return Object.keys(counts).map(st => ({ _id: st, count: counts[st] }));
        }
      }
    }
    return items;
  }

  static _wrap(raw) {
    const doc = { ...raw };
    doc.id = doc._id;
    doc.save = async function () {
      const db = readDB();
      const idx = db.analyses.findIndex(a => a._id.toString() === doc._id.toString());
      if (idx !== -1) {
        doc.updatedAt = new Date().toISOString();
        db.analyses[idx] = { ...doc };
        writeDB(db);
      }
      return doc;
    };
    doc.deleteOne = async function () {
      const db = readDB();
      db.analyses = db.analyses.filter(a => a._id.toString() !== doc._id.toString());
      writeDB(db);
      return true;
    };
    return doc;
  }
}

module.exports = {
  LocalUser,
  LocalAnalysis,
  readDB
};
