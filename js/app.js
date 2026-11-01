/* amazon-linux-create-visual: how to create an Amazon Linux 2023 EC2 server, step by step. No dependencies. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', P = 8;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Text content: edit freely ---------- */
  function C(c, out, mean) { return { c: c, out: out, mean: mean }; }
  function R(a, b) { return [a, b]; }
  var STEPS = [
    { t: 'The big picture', sub: 'What we will create',
      plain: 'Ravi wants a warehouse in the cloud. We will rent a ready-built warehouse (EC2 instance running Amazon Linux 2023), cut one key for it, put a guard on the door, and get its street address.',
      tech: 'EC2 instance + key pair + security group + public IPv4 address.',
      watch: 'You (the AWS Console) and the empty AWS Cloud.',
      why: 'Knowing the four parts first makes every form field make sense.',
      con: { head: 'What we will create', rows: [R('1  EC2 instance', 'the warehouse'), R('2  Key pair', 'the key'), R('3  Security group', 'the door guard'), R('4  Public IPv4 address', 'the street address')] },
      clicks: ['Nothing to click yet. You need an AWS account and an IAM user (avoid daily use of the root user).'] },
    { t: 'Sign in, pick a region', sub: 'Choose the city',
      plain: 'A region is the city where the warehouse stands. Pick one close to you so it feels fast. Everything you create lives in that one city.',
      tech: 'AWS Region (example: ap-south-1, Asia Pacific Mumbai). Resources are regional.',
      watch: 'The region label appears on the AWS Cloud box.',
      why: 'Key pairs and instances are per region. Wrong region = "I cannot see my server".',
      con: { head: 'AWS Management Console', rows: [R('Sign in as', 'IAM user (not root)'), R('Region (top right)', 'Asia Pacific (Mumbai) ap-south-1'), R('Search bar', 'type EC2, open it')] },
      clicks: ['Sign in to the AWS Console.', 'Top right: click the region name and choose your region.', 'Search bar: type EC2 and open EC2.'] },
    { t: 'Launch and name it', sub: 'Instances > Launch instances',
      plain: 'Click Launch instances and give the warehouse a name, like a sign on the door.',
      tech: 'EC2 launch wizard, Name and tags (tag key Name).',
      watch: 'An EC2 box appears, named ravi-warehouse.',
      why: 'Names make servers easy to find when you have many.',
      con: { head: 'Name and tags', rows: [R('Name', 'ravi-warehouse')] },
      clicks: ['EC2 > Instances > Launch instances.', 'Name: ravi-warehouse.'] },
    { t: 'Choose Amazon Linux 2023', sub: 'The AMI blueprint',
      plain: 'An AMI is the blueprint of a ready-built warehouse. We choose AWS\'s own: Amazon Linux 2023, with the rules and tools already installed.',
      tech: 'AMI (Amazon Machine Image): Quick Start > Amazon Linux > Amazon Linux 2023 AMI, 64-bit (x86).',
      watch: 'A chip "AMI: Amazon Linux 2023" appears inside the EC2 box.',
      why: 'The AMI decides the operating system and the login user (ec2-user).',
      con: { head: 'Application and OS Images (Amazon Machine Image)', rows: [R('Quick Start tab', 'Amazon Linux'), R('AMI', 'Amazon Linux 2023 AMI'), R('Architecture', '64-bit (x86)')] },
      clicks: ['Under Application and OS Images click the Amazon Linux tile.', 'Select Amazon Linux 2023 AMI, architecture 64-bit (x86).'],
      cmds: [C('aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text', 'ami-0abcd1234example', 'Prints the latest AL2023 image ID for your region (your ID will differ).')] },
    { t: 'Choose the size', sub: 'Instance type',
      plain: 'The instance type is the size of the warehouse: how many workers (CPU) and how much floor space for work (memory). A small one is enough for learning.',
      tech: 'Instance type, for example t3.micro (2 vCPU, 1 GiB). Pick one marked Free tier eligible if you are learning.',
      watch: 'A chip "Type: t3.micro" appears.',
      why: 'Size drives the bill. Free-tier rules and prices change, so check the console and the AWS pricing page.',
      con: { head: 'Instance type', rows: [R('Instance type', 't3.micro  (Free tier eligible)'), R('vCPU / Memory', '2 vCPU, 1 GiB')] },
      clicks: ['Instance type: open the list.', 'Choose t3.micro (or the type marked Free tier eligible).'] },
    { t: 'Create the key pair', sub: 'The key to the warehouse',
      plain: 'AWS cuts one key for you and lets you download it once. Keep it safe: anyone holding it can enter. PuTTY needs the .ppk shape, MobaXterm uses the .pem shape.',
      tech: 'Key pair (login): RSA, private key file format .pem (OpenSSH, MobaXterm) or .ppk (PuTTY). Saved as my-key.',
      watch: 'A key travels from AWS to your laptop.',
      why: 'The download happens only once. No key, no login.',
      con: { head: 'Key pair (login)', rows: [R('Key pair name', 'my-key'), R('Key pair type', 'RSA'), R('Private key file format', '.pem (MobaXterm) or .ppk (PuTTY)')] },
      clicks: ['Key pair (login) > Create new key pair.', 'Name: my-key. Type: RSA.', 'Format: .ppk for PuTTY, .pem for MobaXterm. Click Create key pair.', 'Save the downloaded file somewhere safe.'],
      cmds: [C("aws ec2 create-key-pair --key-name my-key --query 'KeyMaterial' --output text > my-key.pem", '(no output; the key is saved in my-key.pem)', 'Creates the same key from the command line.')] },
    { t: 'Network and door guard', sub: 'Public IP + security group',
      plain: 'The warehouse stands on a fenced plot (VPC) near the main gate (Internet Gateway). We ask for a street address (public IP) and a door guard (security group) who lets only YOU use the SSH phone extension (port 22).',
      tech: 'Network settings: VPC, public subnet, Auto-assign public IP = Enable, new security group with inbound SSH TCP 22 from My IP.',
      watch: 'The VPC, subnet and gate appear. The SG guard tag shows "SSH 22 My IP only".',
      why: 'Allowing SSH from Anywhere (0.0.0.0/0) invites attacks from the whole internet.',
      con: { head: 'Network settings', rows: [R('VPC', 'default VPC (or your own)'), R('Subnet', 'a public subnet'), R('Auto-assign public IP', 'Enable'), R('Firewall (security groups)', 'Create security group: ravi-warehouse-sg'), R('Allow SSH traffic from', 'My IP (not Anywhere)')] },
      clicks: ['Network settings > Edit if you want to choose VPC and subnet.', 'Auto-assign public IP: Enable.', 'Create security group. Tick Allow SSH traffic from and choose My IP.'] },
    { t: 'Storage', sub: 'The floor space',
      plain: 'Storage is the disk, the floor space of the warehouse. The default is enough for now.',
      tech: 'EBS root volume, 8 GiB gp3.',
      watch: 'A chip "Disk: 8 GiB gp3" appears.',
      why: 'The disk keeps billing after a Stop, until you delete it.',
      con: { head: 'Configure storage', rows: [R('Root volume', '1 x 8 GiB gp3')] },
      clicks: ['Configure storage: keep 1 x 8 GiB gp3.'] },
    { t: 'Launch and wait', sub: 'pending > running',
      plain: 'Press Launch instance. AWS builds the warehouse. First it is "pending" (under construction), then "running". Then two inspections (status checks) must pass.',
      tech: 'Instance state pending > running. Status checks: system and instance, 2/2 passed.',
      watch: 'The state badge changes from pending to running. The public IP appears.',
      why: 'Connecting before 2/2 checks pass often fails.',
      con: { head: 'Summary', rows: [R('Number of instances', '1'), R('Click', 'Launch instance'), R('Instance state', 'pending, then running'), R('Status checks', '2/2 checks passed (1 to 2 minutes)')] },
      clicks: ['Check the Summary panel on the right.', 'Click Launch instance.', 'Click the instance ID, then wait for Running and 2/2 checks passed.'],
      cmds: [C('aws ec2 run-instances --image-id <AMI_ID> --instance-type t3.micro --key-name my-key --security-group-ids <SG_ID> --subnet-id <SUBNET_ID> --associate-public-ip-address --count 1 --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=ravi-warehouse}]"', '{ "Instances": [ { "InstanceId": "i-0123456789abcdef0", "State": { "Name": "pending" } } ] }', 'The command-line version of the whole wizard (placeholders in angle brackets).')] },
    { t: 'Find the address', sub: 'Public IPv4 address',
      plain: 'Open the instance and copy its street address (Public IPv4 address). You type this into PuTTY or MobaXterm.',
      tech: 'Instance details > Public IPv4 address. It changes after a stop and start unless you attach an Elastic IP. Public IPv4 addresses can carry a small hourly charge; check current pricing.',
      watch: 'The IP is highlighted on the EC2 box and on the laptop.',
      why: 'The wrong or old IP is the most common "connection timed out".',
      con: { head: 'Instance details', rows: [R('Instance state', 'Running'), R('Public IPv4 address', '<EC2_PUBLIC_IP>'), R('Private IPv4 address', '10.0.1.25'), R('Key pair assigned', 'my-key')] },
      clicks: ['EC2 > Instances > click ravi-warehouse.', 'Copy the Public IPv4 address (the open-address button copies it).'],
      cmds: [C("aws ec2 describe-instances --instance-ids <INSTANCE_ID> --query 'Reservations[0].Instances[0].PublicIpAddress' --output text", '<EC2_PUBLIC_IP>', 'Prints the public address.')] },
    { t: 'Connect', sub: 'PuTTY or MobaXterm', term: true,
      plain: 'Call the warehouse. The same key, the same address, the same staff badge (ec2-user). You will see the Amazon Linux welcome and a prompt.',
      tech: 'SSH to ec2-user@<EC2_PUBLIC_IP> on port 22 using my-key.',
      watch: 'A key, then typed commands and answers travel through the gate to the EC2.',
      why: 'This proves the server, key and security group all work together.',
      groups: [['If you use PuTTY', ['Session > Host Name: ec2-user@<EC2_PUBLIC_IP>, Port 22, SSH.', 'Connection > SSH > Auth > Credentials > Private key file: my-key.ppk (made in step 6).', 'Click Open, then Accept on the host key alert.']],
        ['If you use MobaXterm', ['Session > SSH > Remote host: <EC2_PUBLIC_IP>, tick Specify username: ec2-user.', 'Advanced SSH settings > Use private key: my-key.pem.', 'Click OK. Type yes to the host key question.']]] },
    { t: 'Stop or terminate', sub: 'Clean up and stop the bill',
      plain: 'Stop is turning the lights off (the building and floor space still cost a little). Terminate is demolishing the warehouse for good. Learners should terminate when finished.',
      tech: 'Instance state > Stop instance / Terminate (delete) instance. Root EBS volume is deleted on terminate by default.',
      watch: 'Two red notes show what Stop and Terminate do.',
      why: 'Forgotten servers keep charging. Delete what you do not need.',
      con: { head: 'Instance state menu', rows: [R('Stop instance', 'pauses compute; the disk is still billed'), R('Terminate (delete) instance', 'deletes the server and its root disk'), R('Tip', 'Public IP changes after stop/start')] },
      clicks: ['Select the instance > Instance state.', 'Choose Terminate (delete) instance and confirm.'],
      cmds: [C('aws ec2 terminate-instances --instance-ids <INSTANCE_ID>', '{ "TerminatingInstances": [ { "CurrentState": { "Name": "shutting-down" } } ] }', 'Deletes the instance. Use stop-instances to pause instead.')] }
  ];
  var LEGEND = [['\uD83D\uDD11', 'Key / SSH login'], ['\u2709\uFE0F', 'Typed command'], ['\u2705', 'Response'], ['\uD83D\uDE08', 'Not used here']];
  LEGEND.pop();

  /* ---------- SVG helpers ---------- */
  var svg = document.getElementById('diagram');
  function el(tag, a, parent) { var n = document.createElementNS(NS, tag); for (var k in a) { n.setAttribute(k, a[k]); } if (parent) { parent.appendChild(n); } return n; }
  function text(parent, x, y, s, cls, anchor) { var t = el('text', { x: x, y: y, 'class': cls, 'text-anchor': anchor || 'middle' }, parent); t.textContent = s; return t; }
  var W = { w1: 'M180 210 L275 210', w2: 'M325 210 L520 210', kp: 'M260 300 L105 300 L105 260' };
  var defs = el('defs', {}, svg), gW = el('g', {}, svg), gB = el('g', {}, svg), gP = el('g', {}, svg), pieces = [];
  Object.keys(W).forEach(function (id) { el('path', { id: 'w-' + id, d: W[id] }, defs); });
  function piece(layer, from, until, cls) { var g = el('g', { 'class': 'piece ' + (cls || '') }, layer); pieces.push({ g: g, from: from, until: until || 99 }); return g; }
  function wire(id, from) { el('path', { d: W[id], 'class': 'wire allow' }, piece(gW, from)); }
  function box(from, cls, x, y, w, h, title, sub) {
    var g = piece(gB, from, 0, cls);
    el('rect', { x: x, y: y, width: w, height: h, rx: 10, 'class': 'box' }, g);
    text(g, x + w / 2, y + 24, title, 'bt'); text(g, x + w / 2, y + 40, sub, 'bs');
  }
  function area(from, cls, x, y, w, h, title, tx, ty) {
    var g = piece(gB, from, 0, cls);
    el('rect', { x: x, y: y, width: w, height: h, rx: 14, 'class': 'band' }, g); text(g, tx, ty, title, 'bandT', 'start');
  }
  function label(from, until, x, y, s, cls, anchor) { return text(piece(gB, from, until, cls), x, y, s, 'lbl', anchor); }
  function pkt(from, emoji, wid, start, dur, o) {
    o = o || {}; var f = dur / P, g = piece(gP, from, o.until), p = el('g', { 'class': 'pkt', opacity: 0 }, g);
    text(p, 0, 6, emoji, '');
    var m = el('animateMotion', { dur: P + 's', begin: start + 's', repeatCount: 'indefinite', calcMode: 'linear', keyPoints: o.rev ? '1;0;0' : '0;1;1', keyTimes: '0;' + f + ';1' }, p);
    el('mpath', { href: '#w-' + wid }, m);
    el('animate', { attributeName: 'opacity', dur: P + 's', begin: start + 's', repeatCount: 'indefinite', values: '1;1;0;0', keyTimes: '0;' + f + ';' + (f + 0.001) + ';1' }, p);
  }
  function swap(node, vals) { // blink between visible and hidden over one loop
    if (reduced) { node.setAttribute('opacity', vals[0] === '1' ? 1 : 0); return; }
    node.setAttribute('opacity', vals[0]);
    el('animate', { attributeName: 'opacity', dur: P + 's', repeatCount: 'indefinite', values: vals.join(';'), keyTimes: '0;0.35;0.36;1' }, node);
  }

  /* ---------- Diagram (drawn bottom layer first) ---------- */
  area(1, 'blue', 260, 20, 810, 320, 'AWS Cloud', 276, 46);
  label(2, 0, 1054, 46, 'Region: ap-south-1 (Mumbai)', 'blue', 'end');
  area(7, 'teal', 290, 60, 750, 260, 'VPC 10.0.0.0/16', 306, 84);
  area(7, 'gold', 330, 95, 680, 205, 'Public subnet 10.0.1.0/24', 346, 290);
  box(1, 'blue', 30, 150, 150, 110, 'You', 'AWS Console');
  box(7, 'blue', 275, 150, 50, 80, 'IGW', 'gate');
  wire('w1', 7); wire('w2', 7);
  box(3, 'teal', 520, 150, 240, 120, 'EC2 instance', 'ravi-warehouse');
  var chip = function (from, y, s) { text(piece(gB, from, 0, 'teal'), 640, y, s, 'bs'); };
  chip(4, 218, 'AMI: Amazon Linux 2023'); chip(5, 234, 'Type: t3.micro'); chip(8, 250, 'Disk: 8 GiB gp3');
  wire('kp', 6); label(6, 0, 185, 290, 'my-key (.pem / .ppk)', 'gold'); pkt(6, '\uD83D\uDD11', 'kp', 0, 3);
  var sg = piece(gB, 7, 0, 'red');
  el('rect', { x: 609, y: 274, width: 62, height: 16, rx: 8, 'class': 'tagbox' }, sg); text(sg, 640, 286, 'SG guard', 'tagtxt');
  label(7, 0, 780, 252, 'SSH 22', 'green', 'start'); label(7, 0, 780, 266, 'My IP only', 'green', 'start');
  // step 9: state badge and results
  var pend = label(9, 0, 640, 140, 'pending', 'gold'); swap(pend, ['1', '0', '0']);
  var run = label(9, 0, 640, 140, 'running', 'green'); swap(run, ['0', '1', '1']);
  label(9, 0, 780, 193, 'status: 2/2 checks passed', 'green', 'start');
  label(9, 0, 780, 208, 'Public IP:', 'blue', 'start'); label(9, 0, 780, 223, '<EC2_PUBLIC_IP>', 'blue', 'start');
  label(10, 0, 105, 140, 'copy the IP', 'blue');
  // step 11: login, command, answer
  pkt(11, '\uD83D\uDD11', 'w1', 0, 1); pkt(11, '\uD83D\uDD11', 'w2', 1, 1.2);
  pkt(11, '\u2709\uFE0F', 'w1', 3, 1); pkt(11, '\u2709\uFE0F', 'w2', 4, 1.2);
  pkt(11, '\u2705', 'w2', 5.5, 1.2, { rev: true }); pkt(11, '\u2705', 'w1', 6.7, 1, { rev: true });
  label(12, 0, 780, 156, 'Stop = pause (disk still billed)', 'red', 'start'); label(12, 0, 780, 172, 'Terminate = delete it', 'red', 'start');

  /* ---------- Console mock ---------- */
  var conEl = document.getElementById('putty');
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function rowsHTML(rows) { return rows.map(function (r) { return '<div class="row"><span>' + esc(r[0]) + '</span><div class="fld">' + esc(r[1]) + '</div></div>'; }).join(''); }
  var LOGO = ['   ,     #_', '   ~\\_  ####_        Amazon Linux 2023', '  ~~  \\_#####\\', '  ~~     \\###|',
    '  ~~       \\#/ ___   https://aws.amazon.com/linux/amazon-linux-2023', "   ~~       V~' '->", '    ~~~         /', '      ~~._.   _/', '         _/ _/', "       _/m/'"];
  function conHTML(n) {
    var s = STEPS[n - 1];
    if (s.term) {
      var t = LOGO.join('\n') + '\n[ec2-user@ip-10-0-1-25 ~]$ whoami\nec2-user\n[ec2-user@ip-10-0-1-25 ~]$ cat /etc/os-release | grep PRETTY\nPRETTY_NAME="Amazon Linux 2023"\n[ec2-user@ip-10-0-1-25 ~]$ ';
      return '<div class="tb"><span>ec2-user@ip-10-0-1-25:~ (PuTTY or MobaXterm window)</span><i>&#8211;</i><i>&#9633;</i><i>&#10005;</i></div><pre class="term">' + esc(t) + '<span class="cur"></span></pre>';
    }
    var title = n === 1 ? 'Plan' : n === 2 ? 'AWS Management Console' : (n >= 3 && n <= 9) ? 'Launch an instance | EC2' : 'Instances | EC2', body = '', i;
    if (n >= 3 && n <= 9) { for (i = 3; i < n; i++) { var c0 = STEPS[i - 1].con; body += '<div class="csec done"><span>' + esc(c0.head) + '</span><span>&#10003; ' + esc(c0.rows.map(function (r) { return r[1]; }).join(', ')) + '</span></div>'; } }
    body += '<div class="csec now"><h4>' + esc(s.con.head) + '</h4>' + rowsHTML(s.con.rows) + '</div>';
    if (n === 9) { body += '<button class="cbtn" tabindex="-1">Launch instance</button>'; }
    return '<div class="ctop"><span>' + esc(title) + '</span><b>aws</b></div><div class="cbody">' + body + '</div>';
  }

  /* ---------- UI ---------- */
  var nav = document.getElementById('steps'), playBtn = document.getElementById('play'), btns = [], cur = 0, timer = null;
  STEPS.forEach(function (s, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'step';
    b.innerHTML = '<span class="num">' + (i + 1) + '</span><span><b></b><small></small></span>';
    b.querySelector('b').textContent = s.t; b.querySelector('small').textContent = s.sub;
    b.addEventListener('click', function () { stopPlay(); show(i + 1); });
    nav.appendChild(b); btns.push(b);
  });
  LEGEND.forEach(function (l) { var li = document.createElement('li'), sp = document.createElement('span'); sp.textContent = l[0]; li.appendChild(sp); li.appendChild(document.createTextNode(l[1])); document.getElementById('legend').appendChild(li); });
  function h3(box, t) { var h = document.createElement('h3'); h.textContent = t; box.appendChild(h); }
  function renderCmds(s) {
    var box = document.getElementById('cmds'); box.textContent = '';
    document.getElementById('cmd-head').textContent = 'What to click';
    (s.groups || [['', s.clicks || []]]).forEach(function (g) {
      if (g[0]) { h3(box, g[0]); }
      var ol = document.createElement('ol'); ol.className = 'clicks';
      g[1].forEach(function (c) { var li = document.createElement('li'); li.textContent = c; ol.appendChild(li); }); box.appendChild(ol);
    });
    if (!s.cmds) { return; }
    h3(box, 'AWS CLI alternative (optional)');
    s.cmds.forEach(function (c) {
      var d = document.createElement('div'); d.className = 'cmd';
      d.innerHTML = '<div class="cmdtop"><code></code><button class="cpy" type="button">Copy</button></div><pre class="out"></pre><p class="mean"><b>What this means:</b> <span></span></p>';
      d.querySelector('code').textContent = c.c; d.querySelector('.out').textContent = c.out; d.querySelector('.mean span').textContent = c.mean;
      d.querySelector('.cpy').addEventListener('click', function (e) { var b = e.currentTarget; if (navigator.clipboard) { navigator.clipboard.writeText(c.c); } b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1200); });
      box.appendChild(d);
    });
  }
  function show(n) {
    var fwd = n > cur; cur = n; var s = STEPS[n - 1];
    pieces.forEach(function (p) {
      var on = p.from <= n && n <= p.until; p.g.classList.toggle('hid', !on); p.g.classList.remove('new');
      if (on && p.from === n && (fwd || n === 1)) { void p.g.getBoundingClientRect(); p.g.classList.add('new'); }
    });
    svg.classList.toggle('s3', n >= 7);
    btns.forEach(function (b, i) { if (i + 1 === n) { b.setAttribute('aria-current', 'step'); } else { b.removeAttribute('aria-current'); } b.classList.toggle('done', i + 1 < n); });
    document.getElementById('cap-title').textContent = 'Step ' + n + ': ' + s.t;
    document.getElementById('cap-plain').textContent = s.plain; document.getElementById('cap-tech').textContent = s.tech;
    document.getElementById('cap-watch').textContent = s.watch; document.getElementById('cap-why').textContent = s.why;
    conEl.innerHTML = conHTML(n); renderCmds(s);
  }
  function stopPlay() { if (timer) { clearInterval(timer); timer = null; } playBtn.setAttribute('aria-pressed', 'false'); playBtn.textContent = 'Auto-play'; }
  function startPlay() {
    if (cur >= STEPS.length) { show(1); }
    playBtn.setAttribute('aria-pressed', 'true'); playBtn.textContent = 'Pause';
    timer = setInterval(function () { if (cur >= STEPS.length) { stopPlay(); } else { show(cur + 1); } }, 6000);
  }
  playBtn.addEventListener('click', function () { if (timer) { stopPlay(); } else { startPlay(); } });
  document.getElementById('reset').addEventListener('click', function () { stopPlay(); show(1); });
  if (reduced && svg.pauseAnimations) { svg.pauseAnimations(); }
  show(1);
})();
