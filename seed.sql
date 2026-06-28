-- MockIQ Seed Data
-- Run: Get-Content seed.sql | & "E:\xampp\mysql\bin\mysql.exe" -u root -proot mockiq_db
USE mockiq_db;

-- Seed admin user (password: password)
INSERT IGNORE INTO users (name, email, password, role)
VALUES
    (
        'Admin',
        'admin@mockiq.dev',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin'
    );

-- Domains
INSERT IGNORE INTO domains (id, name, slug, description, icon)
VALUES
    (
        1,
        'Data Structures & Algorithms',
        'dsa',
        'Arrays, trees, graphs, dynamic programming',
        '⬡'
    ),
    (
        2,
        'Web Development',
        'web-dev',
        'React, JavaScript, CSS, REST APIs',
        '◈'
    ),
    (
        3,
        'Core Java',
        'java',
        'OOP, JVM, collections, Spring basics',
        '◉'
    ),
    (
        4,
        'System Design',
        'system-design',
        'Scalability, architecture, databases',
        '◫'
    ),
    (
        5,
        'Python',
        'python',
        'Core Python, libraries, async',
        '◎'
    ),
    (
        6,
        'HR & Behavioral',
        'hr',
        'Communication, ownership, conflict handling',
        '◷'
    );

-- DSA Questions
INSERT IGNORE INTO questions (
    domain_id,
    difficulty,
    question,
    topic,
    hint,
    ideal_answer
)
VALUES
    (
        1,
        'Easy',
        'What is the time complexity of binary search and why?',
        'Searching',
        'Think about how many elements you eliminate per step.',
        'Binary search runs in O(log n). Each iteration halves the search space, so at most log2(n) comparisons are needed before the target is found or the array is exhausted.'
    ),
    (
        1,
        'Medium',
        'Explain QuickSort. What is its average vs worst-case complexity and why do we still prefer it over MergeSort in practice?',
        'Sorting Algorithms',
        'Think about cache performance and in-place sorting.',
        'QuickSort averages O(n log n) but degrades to O(n2) on sorted input with a bad pivot. It is preferred because it sorts in-place, has excellent cache locality, and constant factors are lower than MergeSort. MergeSort requires O(n) extra memory.'
    ),
    (
        1,
        'Hard',
        'Given a directed graph, how do you detect a cycle? Explain both DFS-based and topological sort approaches.',
        'Graph Algorithms',
        'Consider coloring nodes: white = unvisited, gray = in-stack, black = done.',
        'DFS approach: maintain a visited and in-recursion-stack set. If DFS reaches a gray node, a cycle exists. Topological sort approach: compute in-degrees, push zero-in-degree nodes to queue, process and reduce neighbours. If the processed count is less than total nodes, a cycle exists.'
    );

-- Web Dev Questions
INSERT IGNORE INTO questions (
    domain_id,
    difficulty,
    question,
    topic,
    hint,
    ideal_answer
)
VALUES
    (
        2,
        'Easy',
        'What is the difference between == and === in JavaScript?',
        'JavaScript Basics',
        'One does type coercion, the other does not.',
        '== performs type coercion before comparison so "1" == 1 is true. === is strict equality and checks both value and type so "1" === 1 is false. Always prefer === to avoid unexpected coercion bugs.'
    ),
    (
        2,
        'Medium',
        'What is the Virtual DOM in React and how does the reconciliation algorithm work?',
        'React Internals',
        'Think about diffing and the Fiber architecture.',
        'The Virtual DOM is a lightweight JS object tree that mirrors the real DOM. On state change, React builds a new VDOM, diffs it against the previous one using same-level comparison and key-based list diffing, and batches the minimal set of real DOM mutations. Fiber is the reconciler that makes this async and interruptible.'
    ),
    (
        2,
        'Hard',
        'Explain HTTP/2 multiplexing. How does it solve head-of-line blocking compared to HTTP/1.1?',
        'Web Protocols',
        'Consider streams, frames, and the single TCP connection.',
        'HTTP/1.1 opens multiple TCP connections and suffers head-of-line blocking where a slow response blocks subsequent ones. HTTP/2 sends all requests and responses over a single TCP connection as binary frames tagged with stream IDs allowing true multiplexing. However TCP-level blocking remains and HTTP/3 with QUIC solves this by running streams independently over UDP.'
    );

-- Java Questions
INSERT IGNORE INTO questions (
    domain_id,
    difficulty,
    question,
    topic,
    hint,
    ideal_answer
)
VALUES
    (
        3,
        'Easy',
        'What is the difference between an interface and an abstract class in Java?',
        'OOP Concepts',
        'Consider multiple inheritance, constructors, and state.',
        'Abstract classes can have state, constructors, and concrete methods. Interfaces in Java 8+ can have default and static methods but no state. A class can implement multiple interfaces but extend only one abstract class. Use abstract class for IS-A with shared state and interface for capability contracts.'
    ),
    (
        3,
        'Medium',
        'How does Java handle memory management? Explain the heap, stack, and GC generations.',
        'JVM Internals',
        'Think about Eden, Survivor spaces, and Old Gen.',
        'Stack holds method frames and primitives per thread. Heap is shared and split into Young Gen with Eden and two Survivor spaces, and Old Gen. Most objects die young in minor GC. Objects surviving multiple collections are promoted to Old Gen which triggers major GC. G1GC divides heap into equal size regions for predictable pause times.'
    );

-- System Design Questions
INSERT IGNORE INTO questions (
    domain_id,
    difficulty,
    question,
    topic,
    hint,
    ideal_answer
)
VALUES
    (
        4,
        'Medium',
        'Design a URL shortener like bit.ly. Walk through the schema, hashing strategy, and scaling concerns.',
        'Distributed Systems',
        'Think about base62, read-heavy workload, and caching.',
        'Hash long URLs to 6-7 char base62 strings. Store in DB: id, short_code, long_url, created_at. On redirect, cache hot short codes in Redis. For scale: shard DB by short_code prefix, use CDN at edge for reads, rate-limit writes. Handle collisions by checking before insert or using counter-based ID converted to base62.'
    ),
    (
        4,
        'Hard',
        'How would you design a system to handle 1 million concurrent WebSocket connections for a real-time chat app?',
        'Scalability',
        'Think about connection stickiness, message fanout, and horizontal scaling.',
        'Each WebSocket server can hold around 50k connections. Use a load balancer with sticky sessions via consistent hashing. For message fanout, publish to a Pub/Sub system like Redis Streams or Kafka where each server subscribes and pushes to its own connected clients. Store messages in Cassandra for write-heavy ordered workloads. Use heartbeats and reconnect logic for reliability.'
    );

-- HR Questions
INSERT IGNORE INTO questions (
    domain_id,
    difficulty,
    question,
    topic,
    hint,
    ideal_answer
)
VALUES
    (
        6,
        'Easy',
        'Tell me about a time you had a conflict with a teammate. How did you resolve it?',
        'Conflict Resolution',
        'Use the STAR method: Situation, Task, Action, Result.',
        'Structure your answer: briefly describe the conflict as the Situation, your role as the Task, the specific steps you took to resolve it as the Action such as direct conversation and active listening, and the outcome plus what you learned as the Result. Avoid blaming the other person and show maturity and communication skills.'
    ),
    (
        6,
        'Medium',
        'Describe a project where you had to learn a new technology under a tight deadline.',
        'Learning Agility',
        'Focus on your learning process, not just the outcome.',
        'Highlight how you identified the fastest path to competency through docs, tutorials, or colleagues. Explain how you time-boxed exploration vs building, how you asked for help when blocked, and what you delivered. Interviewers want evidence of self-directedness and pragmatism under pressure.'
    );