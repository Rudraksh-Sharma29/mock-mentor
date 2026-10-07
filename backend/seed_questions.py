import os
import sys

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.question import Question

# Seed dataset of 60+ questions
QUESTIONS_DATA = [
    # ==========================================
    # 1. SOFTWARE DEVELOPER (12 Questions)
    # ==========================================
    {
        "job_role": "Software Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the difference between a process and a thread in operating systems?",
        "expected_keywords": "process,thread,memory,address space,overhead,execution,shared memory,lightweight",
        "model_answer": "A process is an independent executing program with its own dedicated memory address space and system resources. A thread is a lightweight unit of execution within a process that shares memory and resources with other threads in the same process, enabling faster context switching and inter-thread communication."
    },
    {
        "job_role": "Software Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "Explain the four pillars of Object-Oriented Programming (OOP).",
        "expected_keywords": "encapsulation,abstraction,inheritance,polymorphism,classes,objects,data hiding,reusability",
        "model_answer": "The four pillars of OOP are: 1. Encapsulation: bundling data and methods into a single unit while hiding internal state. 2. Abstraction: exposing essential details while hiding internal complexity. 3. Inheritance: creating new classes based on existing ones to promote code reusability. 4. Polymorphism: allowing entities to take different forms through overriding or overloading."
    },
    {
        "job_role": "Software Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What is Git rebase and how does it differ from Git merge?",
        "expected_keywords": "git merge,git rebase,commit history,linear history,branch,fast forward,conflict",
        "model_answer": "Git merge integrates changes from another branch by creating a new merge commit, preserving the exact historical timeline of both branches. Git rebase rewrites project history by moving or replaying your feature branch commits onto the tip of the target branch, resulting in a cleaner, linear commit history."
    },
    {
        "job_role": "Software Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What is the Time and Space complexity of QuickSort, and in what scenarios does it perform worst?",
        "expected_keywords": "quicksort,pivot,time complexity,o(n log n),worst case,o(n^2),space complexity,sorted array",
        "model_answer": "QuickSort has an average and best-case time complexity of O(n log n) and an in-place space complexity of O(log n) for recursion stack. The worst-case time complexity is O(n^2), which occurs when the chosen pivot is always the smallest or largest element, such as partitioning an already sorted or reverse-sorted array without randomized pivot selection."
    },
    {
        "job_role": "Software Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "Explain the CAP theorem and describe how distributed databases handle network partitions.",
        "expected_keywords": "cap theorem,consistency,availability,partition tolerance,tradeoff,distributed systems,pacelc",
        "model_answer": "The CAP theorem states that a distributed data store can simultaneously provide at most two out of three guarantees: Consistency (every read receives the most recent write), Availability (every non-failing node returns a response), and Partition Tolerance (system operates despite network dropouts). Because network partitions are inevitable in distributed systems, systems must choose between CP (favoring consistency by rejecting writes during partition) or AP (favoring availability by allowing writes that sync later)."
    },
    {
        "job_role": "Software Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "What is dependency injection and how does it support the Inversion of Control (IoC) principle?",
        "expected_keywords": "dependency injection,inversion of control,ioc,coupling,decoupling,unit testing,interface,constructor",
        "model_answer": "Dependency Injection (DI) is a design pattern implementing Inversion of Control (IoC) where an object receives its dependencies from an external assembler rather than instantiating them internally. This decouples classes from concrete implementations, enhances testability through mocking, and improves modularity and maintainability."
    },
    {
        "job_role": "Software Developer",
        "category": "Behavioral",
        "difficulty": "Easy",
        "question_text": "Tell me about a time you had to debug a difficult software defect under a tight deadline.",
        "expected_keywords": "debugging,root cause,deadline,logs,systematic,testing,collaboration,resolution",
        "model_answer": "When facing a production defect under a tight deadline, I systematically isolated the issue by reproducing it locally, reviewing application logs, and using binary search git bisect to pinpoint the introducing commit. After identifying the root cause, I implemented a targeted fix, added regression tests, and communicated transparently with stakeholders throughout."
    },
    {
        "job_role": "Software Developer",
        "category": "Behavioral",
        "difficulty": "Medium",
        "question_text": "How do you handle disagreements with team members regarding architectural or design decisions?",
        "expected_keywords": "disagreement,code review,collaboration,trade-offs,data-driven,active listening,consensus",
        "model_answer": "I approach architectural disagreements constructively by actively listening to the colleague's perspective, focusing on objective criteria and technical trade-offs such as scalability, maintainability, and delivery timelines. I propose proof-of-concept benchmarks when necessary and align decisions with team and business goals."
    },
    {
        "job_role": "Software Developer",
        "category": "Behavioral",
        "difficulty": "Hard",
        "question_text": "Describe a project where you had to refactor a legacy system without breaking existing functionality.",
        "expected_keywords": "refactoring,legacy,backward compatibility,unit tests,integration tests,strangler pattern,monitoring",
        "model_answer": "I tackled legacy refactoring by first building a comprehensive safety net of unit and integration tests around existing behavior. Next, I incrementally extracted components using patterns like the Strangler Fig, verifying output consistency at each stage with shadow traffic and feature flags to ensure zero downtime."
    },
    {
        "job_role": "Software Developer",
        "category": "Aptitude",
        "difficulty": "Easy",
        "question_text": "If a server cluster has 4 nodes and each node has an independent 90% uptime probability, what is the probability that at least one node is functioning?",
        "expected_keywords": "probability,independent,uptime,downtime,at least one,complement,calculation",
        "model_answer": "The probability that a single node is down is 1 - 0.90 = 0.10. The probability that all 4 independent nodes are down simultaneously is (0.10)^4 = 0.0001 (0.01%). Therefore, the probability that at least one node is functioning is 1 - 0.0001 = 0.9999 or 99.99%."
    },
    {
        "job_role": "Software Developer",
        "category": "Aptitude",
        "difficulty": "Medium",
        "question_text": "You have a sorted array of 1,000,000 elements. How many comparisons are required in the worst-case using binary search?",
        "expected_keywords": "binary search,logarithm,log2,worst case,comparisons,divide and conquer,20",
        "model_answer": "Binary search divides the search space in half with each comparison. The worst-case number of comparisons is ceil(log2(N)) + 1. For N = 1,000,000, since 2^19 = 524,288 and 2^20 = 1,048,576, binary search requires at most 20 comparisons."
    },
    {
        "job_role": "Software Developer",
        "category": "Aptitude",
        "difficulty": "Hard",
        "question_text": "Explain how you would estimate the number of API requests per second a web application can handle given database latency and thread pool size.",
        "expected_keywords": "throughput,latency,concurrency,thread pool,little's law,qps,bottleneck",
        "model_answer": "Using Little's Law (Throughput = Concurrency / Latency), if a service has a thread pool of N concurrent worker threads and each request takes an average latency of L seconds (dominated by database queries), the maximum theoretical QPS is N / L. For instance, 100 threads with 50ms (0.05s) latency yields 100 / 0.05 = 2000 QPS before factoring CPU or connection overhead."
    },

    # ==========================================
    # 2. FRONTEND DEVELOPER (12 Questions)
    # ==========================================
    {
        "job_role": "Frontend Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the Virtual DOM in React and how does it optimize rendering performance?",
        "expected_keywords": "virtual dom,reconciliation,diffing algorithm,real dom,tree,rerender,state change,batching",
        "model_answer": "The Virtual DOM is a lightweight in-memory JavaScript representation of the actual DOM. When state changes, React creates a new Virtual DOM tree, performs a diffing algorithm against the previous snapshot (reconciliation), and computes the minimal set of DOM operations required, avoiding expensive direct manipulations of the real DOM."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the CSS Box Model and what is the difference between content-box and border-box?",
        "expected_keywords": "box model,content,padding,border,margin,box-sizing,border-box,content-box",
        "model_answer": "The CSS Box Model consists of content, padding, border, and margin. Under 'content-box' (default), specified width and height apply only to content, meaning padding and borders expand element dimensions. Under 'border-box', specified width and height include content, padding, and borders, making responsive layouts much easier to manage."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "Explain the difference between useEffect, useMemo, and useCallback hooks in React.",
        "expected_keywords": "useeffect,usememo,usecallback,side effects,memoization,dependencies,re-render,performance",
        "model_answer": "useEffect manages side effects (such as data fetching or subscriptions) after rendering. useMemo caches and returns the memoized result of an expensive calculation based on dependencies. useCallback returns a memoized callback function definition to prevent unnecessary re-creations and child component re-renders across renders."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What is Event Bubbling and Event Capturing in the JavaScript DOM event flow?",
        "expected_keywords": "event bubbling,event capturing,event delegation,stoppropagation,target,dom tree,phase",
        "model_answer": "Event flow has three phases: capturing, target, and bubbling. In event capturing (trickling), the event travels down from window and root elements to the target. In event bubbling, the event triggers on the target element and bubbles upwards through parent elements. Developers can stop propagation with event.stopPropagation() or leverage bubbling for event delegation."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "How do you optimize Core Web Vitals (LCP, FID/INP, and CLS) in a modern Single Page Application?",
        "expected_keywords": "core web vitals,lcp,inp,fid,cls,code splitting,lazy loading,image optimization,cdn,layout shift",
        "model_answer": "Optimizing Core Web Vitals involves: 1. Largest Contentful Paint (LCP): fast server response, CDN assets, preloading hero images, and critical CSS. 2. Interaction to Next Paint (INP): code-splitting with React.lazy, offloading heavy computations to Web Workers, and minimizing main-thread blocking JavaScript. 3. Cumulative Layout Shift (CLS): reserving explicit width/height on images/embeds and avoiding dynamic layout injections above the fold."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "Explain the JavaScript Event Loop, Microtask queue, and Macrotask queue with an execution example.",
        "expected_keywords": "event loop,call stack,microtask,macrotask,promises,settimeout,queue,synchronous",
        "model_answer": "JavaScript runs on a single thread with a Call Stack and Event Loop. Synchronous code executes first on the call stack. When async actions resolve, callbacks enter queues: Microtasks (Promises, queueMicrotask, MutationObserver) have higher priority and are completely drained after each task before Macrotasks (setTimeout, setInterval, I/O events) execute one by one."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Behavioral",
        "difficulty": "Easy",
        "question_text": "How do you ensure web accessibility (a11y) when building user interfaces?",
        "expected_keywords": "accessibility,a11y,aria,semantic html,keyboard navigation,screen reader,contrast,wcag",
        "model_answer": "I prioritize accessibility by using semantic HTML tags (such as nav, main, button), ensuring full keyboard navigation with visible focus states, adhering to WCAG color contrast standards, adding meaningful ARIA attributes where needed, and testing with automated linters (axe-core) and screen readers."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Behavioral",
        "difficulty": "Medium",
        "question_text": "Describe how you collaborate with UI/UX designers when translating Figma designs into code.",
        "expected_keywords": "figma,design system,tokens,responsive,feedback,edge cases,components,collaboration",
        "model_answer": "I collaborate closely with designers by establishing shared design tokens (colors, spacing, typography) in a reusable component library. I review mockups early to discuss responsive breakpoints, animation feasibility, loading states, and edge cases, fostering open communication throughout the sprint."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Behavioral",
        "difficulty": "Hard",
        "question_text": "Tell me about a time you diagnosed and resolved a severe frontend memory leak or performance bottleneck.",
        "expected_keywords": "memory leak,chrome devtools,profiler,heap snapshot,event listener,cleanup,unmount",
        "model_answer": "I used Chrome DevTools Performance and Memory profilers with Heap Snapshots to isolate uncollected DOM elements. I discovered event listeners and timers attached in useEffect that were missing cleanup return functions upon component unmounting. Adding proper cleanup hooks and removing redundant closures resolved the memory leak completely."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Aptitude",
        "difficulty": "Easy",
        "question_text": "If a webpage bundle size is reduced from 2.4 MB to 800 KB, what is the percentage reduction in bundle size?",
        "expected_keywords": "percentage,reduction,calculation,bundle size,compression,math,66.67",
        "model_answer": "The reduction in size is 2.4 MB - 0.8 MB = 1.6 MB. The percentage reduction is (1.6 / 2.4) * 100 = 66.67% reduction."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Aptitude",
        "difficulty": "Medium",
        "question_text": "Explain the difference in network payload efficiency between debounce and throttle with a search bar example.",
        "expected_keywords": "debounce,throttle,events,search,keystroke,api calls,rate limiting,delay",
        "model_answer": "Debouncing postpones execution until a specified quiet period (e.g. 300ms) has elapsed since the last keystroke, firing only once when the user finishes typing. Throttling ensures a function executes at most once every interval (e.g. every 300ms) regardless of input frequency. For search inputs, debouncing is more efficient because it eliminates intermediate queries."
    },
    {
        "job_role": "Frontend Developer",
        "category": "Aptitude",
        "difficulty": "Hard",
        "question_text": "How does tree-shaking eliminate dead code and what module system is required for it to work?",
        "expected_keywords": "tree-shaking,esm,ecmascript modules,dead code,static analysis,bundler,webpack,vite,rollup",
        "model_answer": "Tree-shaking relies on the static structure of ES Modules (ESM with 'import' and 'export' syntax). Because imports and exports cannot be dynamically modified at runtime, bundlers (Vite/Rollup/Webpack) can analyze the AST (Abstract Syntax Tree) to identify and exclude unreferenced exports from the final bundle."
    },

    # ==========================================
    # 3. BACKEND DEVELOPER (12 Questions)
    # ==========================================
    {
        "job_role": "Backend Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What are RESTful API constraints and standard HTTP methods?",
        "expected_keywords": "rest,http methods,get,post,put,delete,stateless,client-server,idempotent",
        "model_answer": "REST is an architectural style based on stateless client-server communication and uniform interfaces. Standard HTTP methods include GET (retrieve resource, idempotent), POST (create resource), PUT (replace resource, idempotent), PATCH (partial update), and DELETE (remove resource, idempotent)."
    },
    {
        "job_role": "Backend Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is an ORM and what are its advantages and disadvantages?",
        "expected_keywords": "orm,object relational mapping,sql,database,abstraction,n+1 problem,productivity",
        "model_answer": "An Object-Relational Mapper (ORM) maps database tables to programming language classes. Advantages include rapid development, type safety, automated migrations, and SQL injection protection. Disadvantages include potential query overhead, complex query generation, and the common N+1 query problem if eager loading is omitted."
    },
    {
        "job_role": "Backend Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "How do database indexes work (e.g., B-Trees) and what are the trade-offs of indexing?",
        "expected_keywords": "indexing,b-tree,lookup,read performance,write performance,disk space,primary key",
        "model_answer": "Database indexes structure column values into balanced search trees (B-Trees/B+Trees) or hash maps, reducing lookups from O(N) full table scans to O(log N). The trade-off is that every write operation (INSERT, UPDATE, DELETE) must also update the index trees, increasing write latency and consuming extra storage."
    },
    {
        "job_role": "Backend Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What is connection pooling and why is it essential for database management in backend services?",
        "expected_keywords": "connection pool,tcp handshake,overhead,concurrency,reuse,database connections,resource limit",
        "model_answer": "Establishing database connections requires expensive network TCP handshakes, TLS negotiation, and authentication. A connection pool maintains a set of pre-established, reusable connections, allowing worker requests to borrow and return connections quickly, maximizing concurrency while protecting the database from connection exhaustion."
    },
    {
        "job_role": "Backend Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "Explain ACID properties in database transactions and how isolation levels prevent anomalies.",
        "expected_keywords": "acid,atomicity,consistency,isolation,durability,dirty read,phantom read,serializable",
        "model_answer": "ACID stands for: Atomicity (all-or-nothing execution), Consistency (maintains schema invariants), Isolation (concurrent transactions do not interfere), and Durability (committed data survives crashes). Isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) progressively prevent concurrency anomalies like dirty reads, non-repeatable reads, and phantom reads via locking or MVCC."
    },
    {
        "job_role": "Backend Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "How would you design a distributed rate limiter for a public API gateway?",
        "expected_keywords": "rate limiter,token bucket,leaky bucket,redis,sliding window,lua script,concurrency",
        "model_answer": "A scalable distributed rate limiter commonly uses Redis with the Sliding Window Log or Token Bucket algorithm. Redis atomic operations or Lua scripts ensure that token increments and timestamp checks execute atomically without race conditions across multiple API gateway nodes, returning HTTP 429 Too Many Requests with Retry-After headers when exceeded."
    },
    {
        "job_role": "Backend Developer",
        "category": "Behavioral",
        "difficulty": "Easy",
        "question_text": "How do you approach database schema migrations in a live production system?",
        "expected_keywords": "migrations,zero downtime,backward compatible,expand and contract,backup,rollback",
        "model_answer": "I use the Expand and Contract pattern for zero-downtime migrations: 1. Add new nullable columns or tables. 2. Update backend code to write to both and read from new fields. 3. Backfill historical data. 4. Deprecate and remove old columns in a subsequent release after verifying stability with rollback plans ready."
    },
    {
        "job_role": "Backend Developer",
        "category": "Behavioral",
        "difficulty": "Medium",
        "question_text": "Describe an incident where a backend microservice experienced cascading failure and how you mitigated it.",
        "expected_keywords": "cascading failure,circuit breaker,fallback,timeouts,bulkhead,retry storm,observability",
        "model_answer": "During a downstream dependency outage, upstream services exhausted thread pools due to missing request timeouts, causing cascading failures. We mitigated the incident by introducing tight HTTP timeouts, implementing Circuit Breaker patterns (like Resilience4j/Istio), adding exponential backoff with jitter on retries, and configuring graceful degradation fallback responses."
    },
    {
        "job_role": "Backend Developer",
        "category": "Behavioral",
        "difficulty": "Hard",
        "question_text": "How do you balance technical debt against urgent feature delivery requirements from product management?",
        "expected_keywords": "technical debt,trade-off,risk assessment,communication,refactoring,velocity,prioritization",
        "model_answer": "I quantify technical debt in terms of business impact: risk of outages, slowed developer velocity, and security exposure. I partner with product managers to allocate a dedicated percentage (e.g. 15-20%) of each sprint capacity to debt reduction, and bundle key refactors alongside feature work that touches those modules."
    },
    {
        "job_role": "Backend Developer",
        "category": "Aptitude",
        "difficulty": "Easy",
        "question_text": "If a cache has a 95% hit ratio with 5ms cache latency and 100ms database latency, what is the average response time?",
        "expected_keywords": "cache hit ratio,latency,average response time,calculation,formula,9.75ms",
        "model_answer": "Average Latency = (Hit Rate * Cache Latency) + (Miss Rate * DB Latency) = (0.95 * 5ms) + (0.05 * 100ms) = 4.75ms + 5.0ms = 9.75ms."
    },
    {
        "job_role": "Backend Developer",
        "category": "Aptitude",
        "difficulty": "Medium",
        "question_text": "How does database sharding distribute data across nodes using consistent hashing?",
        "expected_keywords": "sharding,consistent hashing,hash ring,horizontal scaling,rebalancing,node failure",
        "model_answer": "Consistent hashing maps both data keys and database nodes onto a circular hash ring (0 to 2^32-1). A key is assigned to the nearest clockwise node. When a node is added or removed, only keys belonging to the immediate neighbor need migration (K/N keys on average), avoiding full cluster rebalancing."
    },
    {
        "job_role": "Backend Developer",
        "category": "Aptitude",
        "difficulty": "Hard",
        "question_text": "Explain how message brokers guarantee at-least-once delivery versus exactly-once processing in stream architectures.",
        "expected_keywords": "message broker,kafka,idempotency,acknowledgements,at-least-once,deduplication,transactions",
        "model_answer": "At-least-once delivery is achieved via producer retries and consumer acknowledgements, meaning messages can be duplicated during network disruptions. Exactly-once processing is achieved by combining at-least-once delivery with idempotent consumer handlers (using unique transaction IDs or deduplication tables) and transactional outbox patterns."
    },

    # ==========================================
    # 4. PYTHON DEVELOPER (12 Questions)
    # ==========================================
    {
        "job_role": "Python Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the difference between list and tuple in Python?",
        "expected_keywords": "mutable,immutable,list,tuple,performance,memory,syntax,brackets",
        "model_answer": "Lists are mutable sequences defined with square brackets `[]` where elements can be modified, appended, or removed. Tuples are immutable sequences defined with parentheses `()` whose elements cannot be altered after creation. Tuples consume less memory and offer faster execution and hashability for dict keys."
    },
    {
        "job_role": "Python Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the Global Interpreter Lock (GIL) in Python (CPython)?",
        "expected_keywords": "gil,global interpreter lock,cpython,multithreading,bytecode,cpu bound,multiprocessing",
        "model_answer": "The GIL is a mutex in CPython that allows only one native thread to execute Python bytecode at any given time. While it simplifies memory management and C extensions, it prevents multi-threaded CPU-bound programs from utilizing multiple CPU cores. For CPU-bound concurrency, developers use the `multiprocessing` module instead."
    },
    {
        "job_role": "Python Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "Explain Python generators, the yield keyword, and memory benefits over list comprehensions.",
        "expected_keywords": "generators,yield,iterator,lazy evaluation,memory efficiency,next,streaming",
        "model_answer": "A generator is a function that produces a sequence of values lazily on-demand using the `yield` keyword rather than returning everything at once. Because values are calculated one at a time via the iterator protocol, generators consume minimal O(1) memory, making them ideal for processing huge datasets or infinite streams."
    },
    {
        "job_role": "Python Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What are Python decorators and how do you write a parameterized decorator?",
        "expected_keywords": "decorators,higher-order function,functools.wraps,arguments,wrapper,closure",
        "model_answer": "Decorators are higher-order functions that wrap another function to extend or modify its behavior without altering its source code. A parameterized decorator requires an outer factory function that accepts arguments and returns the actual decorator function, wrapping the target with `functools.wraps`."
    },
    {
        "job_role": "Python Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "Explain Python async/await, asyncio event loop, and how it handles asynchronous I/O.",
        "expected_keywords": "asyncio,async,await,coroutine,event loop,non-blocking,concurrency,tasks",
        "model_answer": "Python `asyncio` provides cooperative multitasking using an event loop and coroutines declared with `async def`. When a coroutine hits an `await` on an async I/O operation, it yields execution back to the event loop, which switches to run other ready tasks on a single thread without thread switching overhead."
    },
    {
        "job_role": "Python Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "What are metaclasses in Python and how does Python's class creation lifecycle work under the hood?",
        "expected_keywords": "metaclass,type,__new__,__init__,class creation,dunder methods,oop",
        "model_answer": "In Python, classes are themselves objects created by metaclasses (by default `type`). When a class definition executes, Python calls `__new__` on the metaclass to allocate the class object, followed by `__init__` to initialize class attributes. Custom metaclasses allow intercepting, validating, and modifying class construction dynamically."
    },
    {
        "job_role": "Python Developer",
        "category": "Behavioral",
        "difficulty": "Easy",
        "question_text": "How do you maintain clean code and adhere to PEP 8 standards in collaborative Python repositories?",
        "expected_keywords": "pep 8,formatting,black,flake8,pre-commit,type hints,mypy,linting",
        "model_answer": "I enforce PEP 8 and Pythonic standards using automated tooling in CI/CD and pre-commit hooks, including Black for formatting, Flake8/Ruff for linting, and Mypy for static type checking. I also use clear docstrings and meaningful variable names."
    },
    {
        "job_role": "Python Developer",
        "category": "Behavioral",
        "difficulty": "Medium",
        "question_text": "Describe how you optimize a slow Python data processing pipeline.",
        "expected_keywords": "profiling,cprofile,vectorization,numpy,pandas,multiprocessing,cython,bottleneck",
        "model_answer": "I begin by profiling the application using `cProfile` or `py-spy` to identify CPU and memory bottlenecks. I then optimize hot loops by vectorizing with NumPy/Pandas, utilizing built-in C-accelerated libraries, eliminating duplicate database calls, and leveraging `multiprocessing` for parallel tasks."
    },
    {
        "job_role": "Python Developer",
        "category": "Behavioral",
        "difficulty": "Hard",
        "question_text": "How do you manage dependency conflicts, virtual environments, and reproducible package builds?",
        "expected_keywords": "virtualenv,poetry,pipenv,lockfile,docker,dependencies,reproducibility",
        "model_answer": "I manage project dependencies using modern lockfile-based tools like Poetry or Pipenv alongside containerization with Docker. Lockfiles pin transitive dependencies and exact hashes, ensuring identical builds across development, staging, and production environments."
    },
    {
        "job_role": "Python Developer",
        "category": "Aptitude",
        "difficulty": "Easy",
        "question_text": "What will be the output of `[x * 2 for x in range(5) if x % 2 == 0]` and why?",
        "expected_keywords": "list comprehension,range,filter,output,even numbers,0, 4, 8",
        "model_answer": "The output is `[0, 4, 8]`. `range(5)` produces 0, 1, 2, 3, 4. The condition `x % 2 == 0` filters for even numbers (0, 2, 4), and `x * 2` doubles them to yield 0, 4, and 8."
    },
    {
        "job_role": "Python Developer",
        "category": "Aptitude",
        "difficulty": "Medium",
        "question_text": "Explain why mutable default arguments (like `def func(a=[]):`) cause unexpected bugs in Python.",
        "expected_keywords": "mutable default argument,function definition,reference,persistence,none idiom",
        "model_answer": "Default parameter expressions in Python are evaluated once when the function is defined, not every time it is called. If a mutable object like a list `[]` is used as default, all subsequent function invocations share the exact same list instance. The idiomatic solution is `def func(a=None): if a is None: a = []`."
    },
    {
        "job_role": "Python Developer",
        "category": "Aptitude",
        "difficulty": "Hard",
        "question_text": "How does Python's Garbage Collector handle cyclic references using reference counting and generational GC?",
        "expected_keywords": "garbage collection,reference counting,cyclic references,generations,gc module,weakref",
        "model_answer": "Python primarily uses reference counting for immediate memory reclamation when an object's count drops to zero. To resolve cyclic references (where object A points to B and B points to A), Python runs a cyclic garbage collector that tracks container objects across three generations (0, 1, 2) using graph traversal to detect unreachable reference loops."
    },

    # ==========================================
    # 5. JAVA DEVELOPER (12 Questions)
    # ==========================================
    {
        "job_role": "Java Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the difference between JDK, JRE, and JVM in Java?",
        "expected_keywords": "jdk,jre,jvm,bytecode,compiler,runtime,development kit,virtual machine",
        "model_answer": "JVM (Java Virtual Machine) executes compiled Java bytecode and manages memory. JRE (Java Runtime Environment) bundles the JVM along with core runtime libraries required to run Java applications. JDK (Java Development Kit) contains the full JRE plus development tools like the javac compiler and debugger."
    },
    {
        "job_role": "Java Developer",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the difference between '==' and the '.equals()' method in Java?",
        "expected_keywords": "equality,==,equals,reference comparison,value comparison,object,hashcode",
        "model_answer": "The `==` operator performs reference equality comparison (checks if both references point to the exact same memory address). The `.equals()` method compares the actual content/value equivalence of objects when overridden (as in String and wrapper classes)."
    },
    {
        "job_role": "Java Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "How does Java's Garbage Collector manage the Heap memory across Young, Old, and Metaspace generations?",
        "expected_keywords": "garbage collector,heap,eden,survivor,young generation,tenured,old generation,metaspace,g1gc",
        "model_answer": "Java's heap is divided into: 1. Young Generation (Eden and Survivor spaces S0/S1) where new objects are allocated and collected via Minor GC. Surviving objects are promoted to 2. Old/Tenured Generation collected via Major/Full GC. 3. Metaspace (in native memory) stores class metadata. Modern collectors like G1GC and ZGC divide heap into regions for low-pause collection."
    },
    {
        "job_role": "Java Developer",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What is the difference between HashMap and ConcurrentHashMap in Java?",
        "expected_keywords": "hashmap,concurrenthashmap,thread safety,synchronization,locks,segment locking,cas",
        "model_answer": "HashMap is not thread-safe and can enter infinite loops or corrupt data during concurrent writes. ConcurrentHashMap provides thread-safety with high concurrency by using bucket-level CAS (Compare-And-Swap) operations and synchronized locks on individual bucket nodes rather than locking the entire map."
    },
    {
        "job_role": "Java Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "Explain the Java Memory Model (JMM), the volatile keyword, and happens-before relationships.",
        "expected_keywords": "java memory model,jmm,volatile,happens-before,cpu cache,visibility,reordering,atomicity",
        "model_answer": "The Java Memory Model (JMM) defines how threads interact through shared memory. Due to CPU caching and instruction reordering, writes by one thread may not be immediately visible to others. The `volatile` keyword guarantees visibility (flushes to main memory) and prevents reordering via memory barriers, establishing a formal happens-before relationship without lock overhead."
    },
    {
        "job_role": "Java Developer",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "What are Spring Boot starters, auto-configuration, and how does `@EnableAutoConfiguration` work?",
        "expected_keywords": "spring boot,starter,auto-configuration,conditional,spring.factories,beans,inversion of control",
        "model_answer": "Spring Boot Starters are dependency descriptors providing curated libraries. Auto-configuration inspects classpath dependencies and declared beans using `@ConditionalOnClass` and `@ConditionalOnMissingBean` annotations to automatically configure necessary Spring application contexts, drastically reducing boilerplate XML and Java config."
    },
    {
        "job_role": "Java Developer",
        "category": "Behavioral",
        "difficulty": "Easy",
        "question_text": "How do you write effective unit tests in Java using JUnit 5 and Mockito?",
        "expected_keywords": "junit 5,mockito,mock,stub,assertions,test-driven,code coverage",
        "model_answer": "I structure unit tests following the AAA (Arrange, Act, Assert) pattern. I use JUnit 5 annotations (`@Test`, `@ParameterizedTest`) and Mockito to mock external dependencies (such as DAOs or REST clients) to verify isolated business logic and edge cases while keeping tests fast and deterministic."
    },
    {
        "job_role": "Java Developer",
        "category": "Behavioral",
        "difficulty": "Medium",
        "question_text": "Tell me about a time you investigated and resolved a High CPU or OutOfMemoryError in a Java application.",
        "expected_keywords": "outofmemoryerror,heap dump,jprofiler,jcmd,visualvm,thread dump,memory leak",
        "model_answer": "When facing an OutOfMemoryError, I captured automated heap dumps (`-XX:+HeapDumpOnOutOfMemoryError`) and analyzed them using Eclipse MAT (Memory Analyzer Tool). I identified uncollected static collections holding onto user session tokens. Replacing them with bounded LRU caches resolved the leak."
    },
    {
        "job_role": "Java Developer",
        "category": "Behavioral",
        "difficulty": "Hard",
        "question_text": "How do you design a scalable microservice architecture using Spring Cloud and resilience patterns?",
        "expected_keywords": "spring cloud,microservices,api gateway,eureka,resilience4j,distributed tracing,circuit breaker",
        "model_answer": "I design Spring microservices with an API Gateway (Spring Cloud Gateway) for routing and rate-limiting, Eureka/Consul for service discovery, Resilience4j for circuit breaking and retries, and OpenTelemetry/Zipkin for distributed tracing to maintain observability across services."
    },
    {
        "job_role": "Java Developer",
        "category": "Aptitude",
        "difficulty": "Easy",
        "question_text": "Why are Strings immutable in Java and what security and performance benefits does this provide?",
        "expected_keywords": "string pool,immutable,security,thread safety,caching,hashcode,memory",
        "model_answer": "Strings are immutable so that Java can utilize the String Constant Pool to save memory. Immutability makes Strings inherently thread-safe without synchronization, allows caching their hashcode for HashMap lookups, and prevents security vulnerabilities when passing connection strings or file paths."
    },
    {
        "job_role": "Java Developer",
        "category": "Aptitude",
        "difficulty": "Medium",
        "question_text": "What is the contract between `hashCode()` and `equals()` in Java, and what happens if it is violated?",
        "expected_keywords": "hashcode,equals,contract,hashmap,hashset,bucket,lookup failure,consistency",
        "model_answer": "The contract states: 1. If two objects are equal according to `equals()`, their `hashCode()` must return the same integer. 2. If `hashCode()` is equal, the objects are not necessarily equal. Violating this contract breaks hashing collections like `HashMap` and `HashSet`, making stored objects unretrievable."
    },
    {
        "job_role": "Java Developer",
        "category": "Aptitude",
        "difficulty": "Hard",
        "question_text": "Explain how Virtual Threads (Project Loom in Java 21) revolutionize high-throughput I/O compared to platform threads.",
        "expected_keywords": "virtual threads,project loom,carrier threads,continuations,blocking io,throughput,concurrency",
        "model_answer": "Platform threads map 1:1 to heavy OS kernel threads. Virtual Threads (Java 21) are ultra-lightweight user-mode threads managed by the JVM. When a virtual thread blocks on I/O, the JVM unmounts it from the carrier OS thread, allowing millions of concurrent tasks to run without complex reactive programming."
    },

    # ==========================================
    # 6. DATA ANALYST / DATA SCIENTIST (6 Questions)
    # ==========================================
    {
        "job_role": "Data Analyst",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL?",
        "expected_keywords": "sql,inner join,left join,outer join,matching rows,null,database",
        "model_answer": "INNER JOIN returns only records that have matching values in both tables. LEFT JOIN returns all records from the left table and matched records from the right table (with NULLs for unmatched). FULL OUTER JOIN returns all records when there is a match in either table."
    },
    {
        "job_role": "Data Analyst",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What are SQL Window Functions and how does `ROW_NUMBER()` differ from `RANK()` and `DENSE_RANK()`?",
        "expected_keywords": "window functions,over,partition by,row_number,rank,dense_rank,ties",
        "model_answer": "Window functions perform calculations across a set of table rows related to the current row without collapsing rows like GROUP BY. `ROW_NUMBER()` gives unique sequential numbers. `RANK()` assigns identical numbers to ties and skips subsequent ranks. `DENSE_RANK()` assigns identical numbers to ties without skipping numbers."
    },
    {
        "job_role": "Data Scientist",
        "category": "Technical",
        "difficulty": "Easy",
        "question_text": "What is the difference between Supervised and Unsupervised Machine Learning?",
        "expected_keywords": "supervised,unsupervised,labeled data,unlabeled,regression,classification,clustering",
        "model_answer": "Supervised learning trains models on labeled input-output datasets to predict outcomes (such as classification and regression). Unsupervised learning identifies hidden patterns, groupings, or clusters in unlabeled data (such as K-Means clustering and PCA dimensionality reduction)."
    },
    {
        "job_role": "Data Scientist",
        "category": "Technical",
        "difficulty": "Medium",
        "question_text": "What is the bias-variance tradeoff in predictive modeling and how do you prevent overfitting?",
        "expected_keywords": "bias,variance,tradeoff,overfitting,underfitting,cross validation,regularization",
        "model_answer": "Bias represents error from erroneous model assumptions (underfitting). Variance represents error from sensitivity to fluctuations in the training set (overfitting). Preventing overfitting involves cross-validation, regularization (L1/L2), pruning, feature selection, and ensemble methods."
    },
    {
        "job_role": "Data Scientist",
        "category": "Technical",
        "difficulty": "Hard",
        "question_text": "Explain Precision, Recall, F1-Score, and ROC-AUC when evaluating imbalanced classification datasets.",
        "expected_keywords": "precision,recall,f1-score,roc-auc,true positive,false positive,imbalanced,confusion matrix",
        "model_answer": "In imbalanced data, accuracy is misleading. Precision measures true positives among predicted positives. Recall measures true positives captured out of all actual positives. F1-Score is the harmonic mean of precision and recall. ROC-AUC evaluates true positive rate versus false positive rate across all classification thresholds."
    },
    {
        "job_role": "Data Analyst",
        "category": "Behavioral",
        "difficulty": "Medium",
        "question_text": "How do you communicate complex statistical insights to non-technical business stakeholders?",
        "expected_keywords": "stakeholders,data visualization,storytelling,business impact,dashboards,clarity",
        "model_answer": "I translate statistical findings into clear business narratives focusing on actionable outcomes, ROI, and key performance indicators. I use intuitive data visualizations and interactive dashboards (Tableau/Power BI) to highlight trends and provide concrete recommendations."
    }
]

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_count = db.query(Question).count()
        print(f"Existing questions count in database: {existing_count}")
        
        # Insert or update questions
        added = 0
        for q_data in QUESTIONS_DATA:
            existing = db.query(Question).filter(
                Question.job_role == q_data["job_role"],
                Question.question_text == q_data["question_text"]
            ).first()
            if not existing:
                q = Question(
                    job_role=q_data["job_role"],
                    category=q_data["category"],
                    difficulty=q_data["difficulty"],
                    question_text=q_data["question_text"],
                    expected_keywords=q_data["expected_keywords"],
                    model_answer=q_data["model_answer"]
                )
                db.add(q)
                added += 1

        db.commit()
        total = db.query(Question).count()
        print(f"Successfully added {added} new questions. Total questions in database: {total}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding questions: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
