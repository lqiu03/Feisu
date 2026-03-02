import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DB_DSN || 'postgres://feishu_admin:secretpassword@localhost:5432/feishu_core',
});

const sql = `
-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '?',
  initials_color TEXT NOT NULL DEFAULT '#8B909A',
  email TEXT,
  org TEXT,
  title TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('group','dm','bot','meeting')),
  name TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  department_tag TEXT,
  is_muted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation members
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id),
  text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  reply_to_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions
CREATE TABLE IF NOT EXISTS reactions (
  message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);

-- Read receipts
CREATE TABLE IF NOT EXISTS read_receipts (
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  last_read_message_id TEXT,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Seed Three Kingdoms users
INSERT INTO users (id, username, display_name, initials, initials_color, email, org, title, is_verified) VALUES
  ('u-liubei',      'liubei',      '刘备',   '刘', '#7B61FF', 'liubei@shuhan.org',    '蜀汉集团', '卧龙阁 | 主公',   true),
  ('u-guanyu',      'guanyu',      '关羽',   '关', '#E8453C', 'guanyu@shuhan.org',    '蜀汉集团', '卧龙阁 | 武圣',   false),
  ('u-zhangfei',    'zhangfei',    '张飞',   '张', '#F5A623', 'zhangfei@shuhan.org',  '蜀汉集团', '猛将',           false),
  ('u-zhugeliang',  'zhugeliang',  '诸葛亮', '诸', '#34C759', 'zhugeliang@shuhan.org','蜀汉集团', '卧龙阁 | 军师',   false),
  ('u-caocao',      'caocao',      '曹操',   '曹', '#3370FF', 'caocao@weiguo.org',    '魏国集团', '丞相',           false),
  ('u-sunquan',     'sunquan',     '孙权',   '孙', '#FFBF00', 'sunquan@dongwu.org',   '东吴集团', '吴王',           false),
  ('u-zhaoyun',     'zhaoyun',     '赵云',   '赵', '#00B8D4', 'zhaoyun@shuhan.org',   '蜀汉集团', '五虎将',         false),
  ('u-zhouyu',      'zhouyu',      '周瑜',   '周', '#5856D6', 'zhouyu@dongwu.org',    '东吴集团', '大都督',         false),
  ('u-lvbu',        'lvbu',        '吕布',   '吕', '#2B303B', NULL,                   NULL,       '天下第一',       false),
  ('u-huangzhong',  'huangzhong',  '黄忠',   '黄', '#FF9500', NULL,                   '蜀汉集团', '老将',           false),
  ('u-machao',      'machao',      '马超',   '马', '#D32F2F', NULL,                   '蜀汉集团', '锦马超',         false),
  ('u-diaochan',    'diaochan',    '貂蝉',   '貂', '#FF6B9D', NULL,                   NULL,       '四大美人',       false),
  ('u-pangtong',    'pangtong',    '庞统',   '庞', '#8BC34A', NULL,                   '蜀汉集团', '凤雏',           false)
ON CONFLICT (id) DO NOTHING;

-- Seed conversations
INSERT INTO conversations (id, type, name, member_count, department_tag) VALUES
  ('c-taoyuan',          'group',   '桃园结义',     4,    NULL),
  ('c-beifa',            'group',   '北伐军团',     186,  '军团'),
  ('c-shuhan-bulletin',  'group',   '蜀汉通告',     500,  NULL),
  ('c-jinnang',          'bot',     '锦囊妙计',     NULL, NULL),
  ('c-fenghuotai',       'bot',     '烽火台',       NULL, NULL),
  ('c-hulaoguan',        'group',   '虎牢关',       45,   NULL),
  ('c-guanyu-dm',        'dm',      '关羽',         2,    NULL),
  ('c-zhugeliang-dm',    'dm',      '诸葛亮',       2,    NULL),
  ('c-zhangfei-dm',      'dm',      '张飞',         2,    NULL),
  ('c-liubei-dm',        'dm',      '刘备(我)',      1,    NULL),
  ('c-wulongge',         'group',   '卧龙阁',       30,   NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed conversation members for 桃园结义
INSERT INTO conversation_members (conversation_id, user_id) VALUES
  ('c-taoyuan', 'u-liubei'),
  ('c-taoyuan', 'u-guanyu'),
  ('c-taoyuan', 'u-zhangfei'),
  ('c-taoyuan', 'u-zhugeliang'),
  ('c-guanyu-dm', 'u-liubei'),
  ('c-guanyu-dm', 'u-guanyu'),
  ('c-zhugeliang-dm', 'u-liubei'),
  ('c-zhugeliang-dm', 'u-zhugeliang'),
  ('c-zhangfei-dm', 'u-liubei'),
  ('c-zhangfei-dm', 'u-zhangfei'),
  ('c-liubei-dm', 'u-liubei')
ON CONFLICT DO NOTHING;

-- Seed messages for 桃园结义
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('m1', 'c-taoyuan', 'u-liubei',     '所有兵法和粮草相关文书',                    '2026-02-27T10:00:00Z'),
  ('m2', 'c-taoyuan', 'u-liubei',     '善',                                       '2026-02-27T10:01:00Z'),
  ('m3', 'c-taoyuan', 'u-liubei',     '直接去营帐面议，然后拉入军帐',               '2026-02-27T10:02:00Z'),
  ('m4', 'c-taoyuan', 'u-zhaoyun',    '他现在好像在和主公议事',                     '2026-02-27T10:05:00Z'),
  ('m5', 'c-taoyuan', 'u-huangzhong', '正是',                                     '2026-02-27T10:06:00Z'),
  ('m6', 'c-taoyuan', 'u-huangzhong', '我方才刚收到他的飞鸽传书',                   '2026-02-27T10:07:00Z'),
  ('m7', 'c-taoyuan', 'u-huangzhong', '估计此次议事也非要紧',                       '2026-02-27T10:08:00Z'),
  ('m8', 'c-taoyuan', 'u-huangzhong', '可差人去传唤',                               '2026-02-27T10:09:00Z'),
  ('dm1', 'c-guanyu-dm', 'u-liubei', '此竹简的字体甚是奇异',                '2026-02-09T10:00:00Z'),
  ('dm2', 'c-guanyu-dm', 'u-liubei', '莫非是我这边之疏漏',                  '2026-02-09T10:01:00Z'),
  ('dm3', 'c-guanyu-dm', 'u-guanyu', '用飞鸽传阅或有差池',                  '2026-02-09T10:05:00Z'),
  ('dm4', 'c-guanyu-dm', 'u-guanyu', '在军帐案台上阅览一般无碍',             '2026-02-09T10:06:00Z'),
  ('adm1', 'c-zhugeliang-dm', 'u-zhugeliang', '主公，亮已拟好隆中对，请批阅。', '2026-03-02T11:00:00Z'),
  ('adm2', 'c-zhugeliang-dm', 'u-liubei', '先生之才，备生平仅见，快快请讲！', '2026-03-02T11:05:00Z'),
  ('zdm1', 'c-zhangfei-dm', 'u-zhangfei', '大哥！这丈八蛇矛真好使！', '2026-03-02T12:00:00Z'),
  ('zdm2', 'c-zhangfei-dm', 'u-liubei', '三弟勇猛，但也要保重身体。', '2026-03-02T12:05:00Z'),
  ('ldm1', 'c-liubei-dm', 'u-liubei', '（备忘录）明日与云长商讨练兵一事。', '2026-03-02T13:00:00Z'),
  ('dm5', 'c-guanyu-dm', 'u-guanyu', '本周军师议事可以取消，有事再议',        '2026-02-09T14:00:00Z'),
  ('dm6', 'c-guanyu-dm', 'u-guanyu', '烦请从军令簿上移除，多谢',             '2026-02-10T09:00:00Z'),
  ('dm7', 'c-guanyu-dm', 'u-liubei', '将军何往',                            '2026-02-10T09:30:00Z')
ON CONFLICT (id) DO NOTHING;

UPDATE messages SET is_edited = true WHERE id = 'm9';

-- Add members for all conversations
INSERT INTO conversation_members (conversation_id, user_id) VALUES
  ('c-beifa', 'u-liubei'), ('c-beifa', 'u-zhugeliang'), ('c-beifa', 'u-zhaoyun'), ('c-beifa', 'u-machao'),
  ('c-shuhan-bulletin', 'u-liubei'), ('c-shuhan-bulletin', 'u-zhugeliang'),
  ('c-hulaoguan', 'u-liubei'), ('c-hulaoguan', 'u-lvbu'), ('c-hulaoguan', 'u-guanyu'), ('c-hulaoguan', 'u-zhangfei'),
  ('c-wulongge', 'u-liubei'), ('c-wulongge', 'u-zhugeliang'), ('c-wulongge', 'u-pangtong')
ON CONFLICT DO NOTHING;

-- Messages for 北伐军团
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('beifa1', 'c-beifa', 'u-zhugeliang', '诸将听令，明日卯时出发，目标祁山',          '2026-02-26T08:00:00Z'),
  ('beifa2', 'c-beifa', 'u-zhaoyun',    '末将领命！先锋部队已整装待发',              '2026-02-26T08:05:00Z'),
  ('beifa3', 'c-beifa', 'u-machao',     '西凉骑兵随时可以出动',                      '2026-02-26T08:10:00Z'),
  ('beifa4', 'c-beifa', 'u-liubei',     '务必小心谨慎，粮草先行',                    '2026-02-26T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Messages for 蜀汉通告
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('shu1', 'c-shuhan-bulletin', 'u-zhugeliang', '关于发布《研发质量信用积分制度》（第五版）', '2026-02-25T10:00:00Z'),
  ('shu2', 'c-shuhan-bulletin', 'u-liubei',     '各部门认真学习，严格遵守',                '2026-02-25T10:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- Messages for 锦囊妙计 (bot)
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('jin1', 'c-jinnang', 'u-zhugeliang', '军师锦囊第一计：连环计',                     '2026-02-24T10:00:00Z'),
  ('jin2', 'c-jinnang', 'u-zhugeliang', '军师锦囊第二计：空城计',                     '2026-02-24T10:30:00Z'),
  ('jin3', 'c-jinnang', 'u-liubei',     '先生妙计！',                                '2026-02-24T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Messages for 烽火台 (bot)
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('feng1', 'c-fenghuotai', 'u-zhaoyun', '前方边境烽火台有异动',                      '2026-03-02T10:00:00Z'),
  ('feng2', 'c-fenghuotai', 'u-liubei',  '立即派侦察兵查看',                          '2026-03-02T10:15:00Z'),
  ('feng3', 'c-fenghuotai', 'u-zhaoyun', '报！魏军前锋已到长坂坡',                    '2026-03-02T11:00:00Z'),
  ('feng4', 'c-fenghuotai', 'u-caocao',  '传令下去，三军即刻开赴赤壁。孤要亲眼看看，周郎如何挡我百万雄师！', '2026-03-02T12:00:00Z'),
  ('feng5', 'c-fenghuotai', 'u-zhouyu',  '曹军虽众，皆为北方之士，不习水战。我已定下火攻之计，教那曹贼有来无回。', '2026-03-02T12:10:00Z'),
  ('feng6', 'c-fenghuotai', 'u-caocao',  '黄盖老儿竟敢投靠于孤？甚好！今夜东风骤起，正是孤一统天下之时！', '2026-03-02T14:30:00Z'),
  ('feng7', 'c-fenghuotai', 'u-zhouyu',  '万事俱备，只欠东风。现东风已至，点火！',     '2026-03-02T15:00:00Z'),
  ('feng8', 'c-fenghuotai', 'u-caocao',  '火！漫天大火！撤！快撤向乌林！周郎，此深仇大恨孤必报之！', '2026-03-02T15:20:00Z')
ON CONFLICT (id) DO NOTHING;

-- Messages for 虎牢关
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('hu1', 'c-hulaoguan', 'u-lvbu',      '谁敢与我一战',                              '2026-02-22T10:00:00Z'),
  ('hu2', 'c-hulaoguan', 'u-zhangfei',  '燕人张飞在此！',                            '2026-02-22T10:01:00Z'),
  ('hu3', 'c-hulaoguan', 'u-guanyu',    '二弟莫急，待我与你夹攻',                     '2026-02-22T10:02:00Z'),
  ('hu4', 'c-hulaoguan', 'u-liubei',    '三兄弟齐上！',                              '2026-02-22T10:03:00Z')
ON CONFLICT (id) DO NOTHING;

-- Messages for 卧龙阁
INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES
  ('wu1', 'c-wulongge', 'u-zhugeliang', '今日议题：荆州防务部署',                     '2026-02-21T10:00:00Z'),
  ('wu2', 'c-wulongge', 'u-pangtong',   '我有一计，可保荆州十年无虞',                 '2026-02-21T10:10:00Z'),
  ('wu3', 'c-wulongge', 'u-liubei',     '士元请讲',                                  '2026-02-21T10:12:00Z'),
  ('wu4', 'c-wulongge', 'u-pangtong',   '联吴抗曹，以江东为屏障，荆州为根基',          '2026-02-21T10:15:00Z')
ON CONFLICT (id) DO NOTHING;
`;

async function init() {
  console.log('Connecting to PostgreSQL...');
  try {
    await pool.query(sql);
    console.log('✅ Database initialized with Three Kingdoms data');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  } finally {
    await pool.end();
  }
}

init();
