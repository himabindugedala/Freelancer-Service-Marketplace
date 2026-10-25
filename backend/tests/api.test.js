import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Service } from '../src/models/Service.js';
import { Project } from '../src/models/Project.js';
import { Proposal } from '../src/models/Proposal.js';
import { Order } from '../src/models/Order.js';

describe('Freelance Service Marketplace - Backend API Integration Suite', () => {
  let clientToken = '';
  let clientId = '';
  let freelancerToken = '';
  let freelancerId = '';
  let categoryId = '';
  let serviceId = '';
  let projectId = '';
  let proposalId = '';
  let orderId = '';

  beforeAll(async () => {
    await connectDB();
    // Clean test state
    await User.deleteMany({ email: { $regex: /@testsuite\.com$/ } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@testsuite\.com$/ } });
    await disconnectDB();
  });

  it('1. Health check returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('2. Register client user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Client',
      email: 'client@testsuite.com',
      password: 'SecurePassword123!',
      role: 'client',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('client');

    clientToken = res.body.data.token;
    clientId = res.body.data.user._id;
  });

  it('3. Prevent duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate Client',
      email: 'client@testsuite.com',
      password: 'SecurePassword123!',
      role: 'client',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('4. Register freelancer user successfully with starter profile', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Freelancer',
      email: 'freelancer@testsuite.com',
      password: 'SecurePassword123!',
      role: 'freelancer',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile).toBeDefined();
    expect(res.body.data.user.role).toBe('freelancer');

    freelancerToken = res.body.data.token;
    freelancerId = res.body.data.user._id;
  });

  it('5. Login with valid credentials returns JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'client@testsuite.com',
      password: 'SecurePassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('6. Reject login with invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'client@testsuite.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('7. Role authorization: Client cannot access admin-only endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });

  it('8. Fetch categories or create test category', async () => {
    let cat = await Category.findOne();
    if (!cat) {
      cat = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description',
      });
    }
    categoryId = cat._id.toString();

    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('9. Freelancer creates a published service', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        title: 'I will build an API with Node.js and Express',
        description: 'Professional backend development with automated unit tests and clean code.',
        category: categoryId,
        skills: ['Node.js', 'Express', 'MongoDB'],
        price: 150,
        deliveryTimeDays: 3,
        revisionsAllowed: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    serviceId = res.body.data._id;
  });

  it('10. Client cannot create a service (role restriction)', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Client trying to publish service',
        description: 'This request should fail because user is a client.',
        category: categoryId,
        skills: ['Testing'],
        price: 100,
        deliveryTimeDays: 2,
      });

    expect(res.status).toBe(403);
  });

  it('11. Client posts a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Build a Full-Stack Customer Portal',
        description: 'We need an experienced developer to create a customer portal with dashboard and auth.',
        category: categoryId,
        skills: ['Node.js', 'React', 'MongoDB'],
        budgetType: 'fixed',
        budgetMin: 200,
        budgetMax: 500,
        deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    projectId = res.body.data._id;
  });

  it('12. Freelancer submits proposal for open project', async () => {
    const res = await request(app)
      .post(`/api/proposals/project/${projectId}`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        coverLetter: 'I have 5+ years of experience with Node.js and React. I can deliver this cleanly and on time.',
        bidAmount: 350,
        deliveryTimeDays: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    proposalId = res.body.data._id;
  });

  it('13. Prevent duplicate proposals from same freelancer for same project', async () => {
    const res = await request(app)
      .post(`/api/proposals/project/${projectId}`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        coverLetter: 'Second proposal attempt for same project.',
        bidAmount: 300,
        deliveryTimeDays: 4,
      });

    expect(res.status).toBe(409);
  });

  it('14. Client accepts proposal and generates atomic Order in progress', async () => {
    const res = await request(app)
      .post(`/api/proposals/${proposalId}/accept`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();
    expect(res.body.data.order.status).toBe('in_progress');
    expect(res.body.data.order.paymentStatus).toBe('escrow_held');
    orderId = res.body.data.order._id;
  });

  it('15. Order Lifecycle: Freelancer submits delivery', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        deliveryNotes: 'Here is the completed portal source code and deployment guide.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('delivered');
  });

  it('16. Order Lifecycle: Client approves order completion & releases escrow', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/approve`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.paymentStatus).toBe('released');
  });

  it('17. Client submits 5-star review for completed order', async () => {
    const res = await request(app)
      .post(`/api/reviews/order/${orderId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        rating: 5,
        comment: 'Outstanding delivery! Fast, responsive, and high quality code.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('18. Prevent duplicate review for same order', async () => {
    const res = await request(app)
      .post(`/api/reviews/order/${orderId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        rating: 4,
        comment: 'Trying to review again.',
      });

    expect(res.status).toBe(409);
  });
});
